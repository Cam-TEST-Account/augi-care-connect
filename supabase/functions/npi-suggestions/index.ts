import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuggestionParams {
  query: string;
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 5 }: SuggestionParams = await req.json();

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Split the query into potential first and last name
    const nameParts = query.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Build query parameters for CMS NPI Registry API
    const params = new URLSearchParams();
    params.append('first_name', firstName);
    if (lastName) {
      params.append('last_name', lastName);
    }
    params.append('limit', Math.min(limit * 3, 50).toString()); // Get more to filter
    params.append('version', '2.1');

    const apiUrl = `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`;

    console.log('Fetching suggestions from NPI Registry:', apiUrl);

    // Fetch from CMS NPI Registry API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AugiHealth-Provider-Search/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`NPI API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform results into suggestion format
    const suggestions = (data.results || [])
      .slice(0, limit)
      .map((provider: any) => {
        const basic = provider.basic || {};
        const primaryTaxonomy = provider.taxonomies?.find((t: any) => t.primary) || provider.taxonomies?.[0] || {};
        
        const fullName = basic.organization_name || 
          `Dr. ${basic.first_name || ''} ${basic.last_name || ''}`.trim();
        
        const specialty = primaryTaxonomy.desc || 'Healthcare Provider';
        
        return {
          name: fullName,
          specialty: specialty,
          npi: provider.number,
          display: `${fullName} - ${specialty}`,
          location: (() => {
            const addresses = provider.addresses || [];
            const location = addresses.find((addr: any) => addr.address_purpose === 'LOCATION') || addresses[0];
            return location ? `${location.city || ''}, ${location.state || ''}`.replace(/^,\s*|,\s*$/g, '') : '';
          })()
        };
      });

    console.log(`Generated ${suggestions.length} suggestions for query: ${query}`);

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating suggestions:', error);
    
    return new Response(
      JSON.stringify({ 
        suggestions: [],
        error: 'Failed to generate suggestions'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});