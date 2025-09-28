import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface EHRIntegrationRequest {
  action: 'initiate_oauth' | 'handle_callback' | 'refresh_token' | 'disconnect';
  ehr_system: 'epic' | 'athena';
  code?: string;
  state?: string;
  redirect_uri?: string;
}

// EHR System Configurations
const EHR_CONFIGS = {
  epic: {
    sandbox_base_url: 'https://fhir.epic.com/interconnect-fhir-oauth',
    oauth_url: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
    token_url: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    scopes: 'patient/*.read user/*.read launch/patient'
  },
  athena: {
    sandbox_base_url: 'https://api.athenahealth.com/preview1',
    oauth_url: 'https://api.athenahealth.com/oauthpreview/authorize',
    token_url: 'https://api.athenahealth.com/oauthpreview/token',
    scopes: 'patient/*.read user/*.read'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get provider profile
    const { data: providerProfile, error: providerError } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (providerError || !providerProfile) {
      return new Response(
        JSON.stringify({ error: 'Provider profile not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ehr_system, code, state, redirect_uri }: EHRIntegrationRequest = await req.json();

    console.log(`EHR Integration: ${action} for ${ehr_system} by provider ${providerProfile.id}`);

    switch (action) {
      case 'initiate_oauth':
        if (!ehr_system || !['epic', 'athena'].includes(ehr_system)) {
          return new Response(
            JSON.stringify({ error: 'Invalid EHR system specified' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const config = EHR_CONFIGS[ehr_system];
        const client_id = Deno.env.get(`${ehr_system.toUpperCase()}_CLIENT_ID`);
        
        if (!client_id) {
          return new Response(
            JSON.stringify({ 
              error: `${ehr_system} integration not configured`,
              details: `Missing ${ehr_system.toUpperCase()}_CLIENT_ID environment variable`
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate state parameter for security
        const oauthState = `${providerProfile.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ehr-integration/callback`;

        // Store state in database for verification (using patient_id from URL params or session)
        const patientId = new URL(req.url).searchParams.get('patient_id');
        if (!patientId) {
          return new Response(
            JSON.stringify({ error: 'Patient ID required for EHR integration' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabase
          .from('ehr_oauth_sessions')
          .insert({
            patient_id: patientId,
            ehr_system,
            state: oauthState,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
          });

        const oauthUrl = new URL(config.oauth_url);
        oauthUrl.searchParams.set('response_type', 'code');
        oauthUrl.searchParams.set('client_id', client_id);
        oauthUrl.searchParams.set('redirect_uri', callbackUrl);
        oauthUrl.searchParams.set('scope', config.scopes);
        oauthUrl.searchParams.set('state', oauthState);

        return new Response(
          JSON.stringify({ 
            success: true, 
            oauth_url: oauthUrl.toString(),
            state: oauthState
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'handle_callback':
        if (!code || !state) {
          return new Response(
            JSON.stringify({ error: 'Missing authorization code or state' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify state parameter
        const { data: oauthSession, error: sessionError } = await supabase
          .from('ehr_oauth_sessions')
          .select('*')
          .eq('state', state)
          .single();

        if (sessionError || !oauthSession) {
          return new Response(
            JSON.stringify({ error: 'Invalid or expired OAuth session' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Exchange code for access token
        const ehrConfig = EHR_CONFIGS[oauthSession.ehr_system as keyof typeof EHR_CONFIGS];
        const clientId = Deno.env.get(`${oauthSession.ehr_system.toUpperCase()}_CLIENT_ID`);
        const clientSecret = Deno.env.get(`${oauthSession.ehr_system.toUpperCase()}_CLIENT_SECRET`);

        if (!clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ error: 'EHR integration credentials not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const tokenResponse = await fetch(ehrConfig.token_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/ehr-integration/callback`
          })
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error(`Token exchange failed:`, errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to exchange authorization code for access token' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const tokenData = await tokenResponse.json();

        // Store EHR connection
        const { data: connection, error: connectionError } = await supabase
          .from('ehr_connections')
          .upsert({
            patient_id: oauthSession.patient_id,
            ehr_system: oauthSession.ehr_system,
            provider_external_id: tokenData.provider_id || `provider_${Date.now()}`,
            provider_name: tokenData.provider_name || 'Unknown Provider',
            ehr_facility_name: tokenData.facility_name || null,
            specialty: tokenData.specialty || null,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
            encounter_id: tokenData.encounter || null,
            is_active: true,
            last_sync_date: new Date().toISOString()
          }, {
            onConflict: 'patient_id, ehr_system'
          })
          .select()
          .single();

        // Clean up OAuth session
        await supabase
          .from('ehr_oauth_sessions')
          .delete()
          .eq('state', state);

        if (connectionError) {
          return new Response(
            JSON.stringify({ error: 'Failed to store EHR connection' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully connected to ${oauthSession.ehr_system}`,
            connection_id: connection.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'refresh_token':
        if (!ehr_system) {
          return new Response(
            JSON.stringify({ error: 'EHR system not specified' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get existing connection
        const { data: existingConnection, error: fetchError } = await supabase
          .from('ehr_connections')
          .select('*')
          .eq('provider_id', providerProfile.id)
          .eq('ehr_system', ehr_system)
          .eq('is_active', true)
          .single();

        if (fetchError || !existingConnection) {
          return new Response(
            JSON.stringify({ error: 'No active EHR connection found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Refresh the token
        const refreshConfig = EHR_CONFIGS[ehr_system as keyof typeof EHR_CONFIGS];
        const refreshClientId = Deno.env.get(`${ehr_system.toUpperCase()}_CLIENT_ID`);
        const refreshClientSecret = Deno.env.get(`${ehr_system.toUpperCase()}_CLIENT_SECRET`);

        const refreshResponse = await fetch(refreshConfig.token_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${refreshClientId}:${refreshClientSecret}`)}`
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: existingConnection.refresh_token
          })
        });

        if (!refreshResponse.ok) {
          await supabase
            .from('ehr_connections')
            .update({ is_active: false })
            .eq('id', existingConnection.id);

          return new Response(
            JSON.stringify({ error: 'Failed to refresh access token. Please reconnect.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const refreshTokenData = await refreshResponse.json();

        // Update connection with new tokens
        await supabase
          .from('ehr_connections')
          .update({
            access_token: refreshTokenData.access_token,
            refresh_token: refreshTokenData.refresh_token || existingConnection.refresh_token,
            token_expires_at: new Date(Date.now() + (refreshTokenData.expires_in * 1000)).toISOString(),
            last_sync_date: new Date().toISOString()
          })
          .eq('id', existingConnection.id);

        return new Response(
          JSON.stringify({ success: true, message: 'Token refreshed successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'disconnect':
        if (!ehr_system) {
          return new Response(
            JSON.stringify({ error: 'EHR system not specified' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Deactivate the connection
        const { error: disconnectError } = await supabase
          .from('ehr_connections')
          .update({ is_active: false })
          .eq('provider_id', providerProfile.id)
          .eq('ehr_system', ehr_system);

        if (disconnectError) {
          return new Response(
            JSON.stringify({ error: 'Failed to disconnect EHR system' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: `Disconnected from ${ehr_system}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('EHR Integration Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});