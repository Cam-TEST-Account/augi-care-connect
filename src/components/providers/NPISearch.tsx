import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Loader2,
  MapPin,
  Phone,
  Mail,
  Building,
  UserCheck,
  Copy,
  ExternalLink
} from 'lucide-react';

interface NPIProvider {
  npi: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  credential?: string;
  taxonomies: Array<{
    code: string;
    desc: string;
    primary: boolean;
    specialization?: string;
  }>;
  practiceLocation?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    telephone?: string;
    fax?: string;
  };
  mailingAddress?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    telephone?: string;
    fax?: string;
  };
  enumerationDate: string;
  status: string;
  organizationName?: string;
}

interface NPISearchResult {
  resultCount: number;
  results: NPIProvider[];
  searchCriteria: {
    firstName?: string;
    lastName?: string;
    npiNumber?: string;
  };
}

export const NPISearch: React.FC = () => {
  const [searchType, setSearchType] = useState<'name' | 'npi'>('name');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [npiNumber, setNpiNumber] = useState('');
  const [searchResults, setSearchResults] = useState<NPISearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (searchType === 'name' && !firstName.trim() && !lastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter at least a first name or last name",
        variant: "destructive"
      });
      return;
    }

    if (searchType === 'npi' && !npiNumber.trim()) {
      toast({
        title: "Missing Information", 
        description: "Please enter an NPI number",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase.functions.invoke('npi-search', {
        body: searchType === 'name' ? {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          limit: 50
        } : {
          npiNumber: npiNumber.trim(),
          limit: 50
        }
      });

      if (error) throw error;

      setSearchResults(data);

      if (data.resultCount === 0) {
        toast({
          title: "No Results",
          description: "No providers found matching your search criteria",
        });
      } else {
        toast({
          title: "Search Complete",
          description: `Found ${data.resultCount} provider${data.resultCount === 1 ? '' : 's'}`,
        });
      }

    } catch (error) {
      console.error('Error searching NPI registry:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search the NPI registry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            NPI Registry Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Type Toggle */}
          <div className="flex space-x-2">
            <Button
              variant={searchType === 'name' ? 'default' : 'outline'}
              onClick={() => {
                setSearchType('name');
                setNpiNumber('');
              }}
              size="sm"
            >
              Search by Name
            </Button>
            <Button
              variant={searchType === 'npi' ? 'default' : 'outline'}
              onClick={() => {
                setSearchType('npi');
                setFirstName('');
                setLastName('');
              }}
              size="sm"
            >
              Search by NPI
            </Button>
          </div>

          {/* Search Fields */}
          {searchType === 'name' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="npiNumber">NPI Number</Label>
              <Input
                id="npiNumber"
                value={npiNumber}
                onChange={(e) => setNpiNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit NPI number..."
                maxLength={10}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          )}

          {/* Search Button */}
          <Button onClick={handleSearch} disabled={isSearching} className="w-full">
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching NPI Registry...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Providers
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results ({searchResults.resultCount} found)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No providers found matching your search criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.results.map((provider) => (
                  <Card key={provider.npi} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback>
                              {provider.organizationName 
                                ? provider.organizationName.slice(0, 2).toUpperCase()
                                : `${provider.firstName[0]}${provider.lastName[0]}`
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {provider.organizationName || 
                                `${provider.firstName} ${provider.middleName ? provider.middleName + ' ' : ''}${provider.lastName}`
                              }
                              {provider.credential && `, ${provider.credential}`}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="font-mono">
                                NPI: {provider.npi}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(provider.npi, 'NPI number')}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Badge variant={provider.status === 'A' ? 'default' : 'secondary'}>
                                {provider.status === 'A' ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Specialties:</h4>
                        <div className="flex flex-wrap gap-2">
                          {provider.taxonomies.map((taxonomy, idx) => (
                            <Badge 
                              key={idx} 
                              variant={taxonomy.primary ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {taxonomy.desc}
                              {taxonomy.primary && ' (Primary)'}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Practice Location */}
                      {provider.practiceLocation && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2 flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            Practice Location:
                          </h4>
                          <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                            <p className="flex items-center text-sm">
                              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                              {provider.practiceLocation.address1}
                              {provider.practiceLocation.address2 && `, ${provider.practiceLocation.address2}`}
                            </p>
                            <p className="text-sm ml-6">
                              {provider.practiceLocation.city}, {provider.practiceLocation.state} {provider.practiceLocation.postalCode}
                            </p>
                            {provider.practiceLocation.telephone && (
                              <p className="flex items-center text-sm">
                                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                {formatPhone(provider.practiceLocation.telephone)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(provider.practiceLocation!.telephone!, 'Phone number')}
                                  className="ml-1"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2 border-t">
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                        <Button variant="outline" size="sm">
                          <UserCheck className="w-4 h-4 mr-2" />
                          Add to Network
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://npiregistry.cms.hhs.gov/search?number=${provider.npi}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Full Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};