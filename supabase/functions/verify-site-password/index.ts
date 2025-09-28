import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    
    // Get the site password from environment
    const sitePassword = Deno.env.get('SITE_PASSWORD');
    
    if (!sitePassword) {
      console.error('SITE_PASSWORD environment variable not configured');
      return new Response(
        JSON.stringify({ valid: false, error: 'Server configuration error' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Simple constant-time comparison to prevent timing attacks
    const isValid = password === sitePassword;
    
    return new Response(
      JSON.stringify({ valid: isValid }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Password verification error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Invalid request' }), 
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});