import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NPISearchParams {
  firstName?: string;
  lastName?: string;
  npiNumber?: string;
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, npiNumber, limit = 50 }: NPISearchParams = await req.json();

    // Validate input parameters
    if (!firstName && !lastName && !npiNumber) {
      return new Response(
        JSON.stringify({ error: 'At least one search parameter is required (firstName, lastName, or npiNumber)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Build query parameters for CMS NPI Registry API
    const params = new URLSearchParams();
    
    if (npiNumber) {
      params.append('number', npiNumber);
    } else {
      if (firstName) params.append('first_name', firstName);
      if (lastName) params.append('last_name', lastName);
    }
    
    params.append('limit', Math.min(limit, 200).toString()); // CMS API max is 200
    params.append('version', '2.1');

    const apiUrl = `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`;

    console.log('Fetching from NPI Registry:', apiUrl);

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

    // Transform the data to our format
    const transformedResults = data.results?.map((provider: any) => {
      const basicInfo = provider.basic || {};
      const addresses = provider.addresses || [];
      const practiceLocation = addresses.find((addr: any) => addr.address_purpose === 'LOCATION') || addresses[0];
      const mailingAddress = addresses.find((addr: any) => addr.address_purpose === 'MAILING') || {};
      
      return {
        npi: provider.number,
        firstName: basicInfo.first_name || '',
        lastName: basicInfo.last_name || '',
        middleName: basicInfo.middle_name || '',
        credential: basicInfo.credential || '',
        taxonomies: provider.taxonomies?.map((tax: any) => ({
          code: tax.code,
          desc: tax.desc,
          primary: tax.primary,
          specialization: tax.specialization || '',
        })) || [],
        practiceLocation: practiceLocation ? {
          address1: practiceLocation.address_1 || '',
          address2: practiceLocation.address_2 || '',
          city: practiceLocation.city || '',
          state: practiceLocation.state || '',
          postalCode: practiceLocation.postal_code || '',
          countryCode: practiceLocation.country_code || '',
          telephone: practiceLocation.telephone_number || '',
          fax: practiceLocation.fax_number || '',
        } : null,
        mailingAddress: mailingAddress ? {
          address1: mailingAddress.address_1 || '',
          address2: mailingAddress.address_2 || '',
          city: mailingAddress.city || '',
          state: mailingAddress.state || '',
          postalCode: mailingAddress.postal_code || '',
          countryCode: mailingAddress.country_code || '',
          telephone: mailingAddress.telephone_number || '',
          fax: mailingAddress.fax_number || '',
        } : null,
        enumerationDate: basicInfo.enumeration_date || '',
        lastUpdated: basicInfo.last_updated || '',
        status: basicInfo.status || '',
        organizationName: basicInfo.organization_name || null,
        otherNames: basicInfo.other_names || [],
        identifiers: provider.identifiers || [],
      };
    }) || [];

    const result = {
      resultCount: data.result_count || 0,
      results: transformedResults,
      searchCriteria: {
        firstName,
        lastName,
        npiNumber,
        limit
      }
    };

    console.log(`Found ${result.resultCount} providers`);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in NPI search:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to search NPI registry', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});