import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-augi-app-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface PatientSyncRequest {
  action: 'get' | 'create' | 'update' | 'sync';
  patientId?: string;
  patientData?: any;
  lastSyncTimestamp?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
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

    const { action, patientId, patientData, lastSyncTimestamp }: PatientSyncRequest = await req.json();

    console.log(`Augi Pass API: ${action} request from provider ${providerProfile.id}`);

    switch (action) {
      case 'get':
        if (!patientId) {
          return new Response(
            JSON.stringify({ error: 'Patient ID required for get action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get patient with all related data
        const { data: patient, error: getError } = await supabase
          .from('patients')
          .select(`
            *,
            vital_signs (*),
            lab_results (*),
            prescriptions (*),
            appointments (*),
            clinical_notes (*),
            ehr_connections (*)
          `)
          .eq('id', patientId)
          .or(`primary_provider_id.eq.${providerProfile.id},appointments.provider_id.eq.${providerProfile.id}`)
          .single();

        if (getError) {
          return new Response(
            JSON.stringify({ error: 'Patient not found or access denied' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: patient }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'sync':
        // Get all patients updated since last sync
        const syncTimestamp = lastSyncTimestamp || new Date(0).toISOString();
        
        const { data: updatedPatients, error: syncError } = await supabase
          .from('patients')
          .select(`
            *,
            vital_signs (*),
            lab_results (*),
            prescriptions (*),
            appointments (*),
            clinical_notes (*)
          `)
          .or(`primary_provider_id.eq.${providerProfile.id},appointments.provider_id.eq.${providerProfile.id}`)
          .gte('updated_at', syncTimestamp)
          .order('updated_at', { ascending: false });

        if (syncError) {
          return new Response(
            JSON.stringify({ error: 'Sync failed' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: updatedPatients,
            syncTimestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'create':
        if (!patientData) {
          return new Response(
            JSON.stringify({ error: 'Patient data required for create action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create new patient
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            ...patientData,
            primary_provider_id: providerProfile.id,
            external_patient_id: patientData.external_patient_id || `augi_${Date.now()}`
          })
          .select()
          .single();

        if (createError) {
          return new Response(
            JSON.stringify({ error: 'Failed to create patient', details: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: newPatient }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'update':
        if (!patientId || !patientData) {
          return new Response(
            JSON.stringify({ error: 'Patient ID and data required for update action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update existing patient
        const { data: updatedPatient, error: updateError } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', patientId)
          .or(`primary_provider_id.eq.${providerProfile.id},appointments.provider_id.eq.${providerProfile.id}`)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update patient', details: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: updatedPatient }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Augi Pass API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});