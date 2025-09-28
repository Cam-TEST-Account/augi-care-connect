import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  ExternalLink,
  ChevronDown,
  Star,
  Filter
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

const POPULAR_SPECIALTIES = [
  'Family Medicine',
  'Internal Medicine', 
  'Cardiology',
  'Dermatology',
  'Orthopedic Surgery',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Emergency Medicine',
  'Obstetrics & Gynecology'
];

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const EnhancedNPISearch: React.FC = () => {
  const [searchType, setSearchType] = useState<'name' | 'npi' | 'advanced'>('name');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [npiNumber, setNpiNumber] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [searchResults, setSearchResults] = useState<NPISearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSpecialtyPopover, setShowSpecialtyPopover] = useState(false);
  const [showStatePopover, setShowStatePopover] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { toast } = useToast();

  // Auto-suggestion for provider names
  useEffect(() => {
    if (searchType === 'name' && (firstName.length > 2 || lastName.length > 2)) {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
      
      suggestionTimeoutRef.current = setTimeout(() => {
        generateSuggestions();
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [firstName, lastName, searchType]);

  const generateSuggestions = () => {
    // Mock suggestions based on input - in real implementation, this would query a provider database
    const mockSuggestions = [
      'Dr. John Smith - Cardiology',
      'Dr. Jane Johnson - Family Medicine',
      'Dr. Michael Brown - Internal Medicine',
      'Dr. Sarah Davis - Pediatrics',
      'Dr. Robert Wilson - Orthopedic Surgery'
    ].filter(suggestion => {
      const name = suggestion.toLowerCase();
      const firstMatch = firstName.length > 2 ? name.includes(firstName.toLowerCase()) : true;
      const lastMatch = lastName.length > 2 ? name.includes(lastName.toLowerCase()) : true;
      return firstMatch && lastMatch;
    });

    setSuggestions(mockSuggestions);
    setShowSuggestions(mockSuggestions.length > 0);
  };

  const handleSearch = async () => {
    let hasValidInput = false;
    
    if (searchType === 'name' && (firstName.trim() || lastName.trim())) {
      hasValidInput = true;
    } else if (searchType === 'npi' && npiNumber.trim()) {
      hasValidInput = true;
    } else if (searchType === 'advanced' && (firstName.trim() || lastName.trim() || specialty.trim() || state.trim())) {
      hasValidInput = true;
    }

    if (!hasValidInput) {
      toast({
        title: "Missing Information",
        description: "Please enter search criteria",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      let searchParams: any = { limit: 50 };
      
      if (searchType === 'name') {
        searchParams.firstName = firstName.trim() || undefined;
        searchParams.lastName = lastName.trim() || undefined;
      } else if (searchType === 'npi') {
        searchParams.npiNumber = npiNumber.trim();
      } else if (searchType === 'advanced') {
        searchParams.firstName = firstName.trim() || undefined;
        searchParams.lastName = lastName.trim() || undefined;
        searchParams.specialty = specialty.trim() || undefined;
        searchParams.state = state.trim() || undefined;
        searchParams.city = city.trim() || undefined;
      }

      const { data, error } = await supabase.functions.invoke('npi-search', {
        body: searchParams
      });

      if (error) throw error;

      setSearchResults(data);

      if (data.resultCount === 0) {
        toast({
          title: "No Results",
          description: "No providers found matching your search criteria. Try broadening your search.",
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

  const handleSuggestionSelect = (suggestion: string) => {
    const parts = suggestion.split(' - ');
    if (parts.length >= 2) {
      const namePart = parts[0].replace('Dr. ', '').trim();
      const names = namePart.split(' ');
      if (names.length >= 2) {
        setFirstName(names[0]);
        setLastName(names.slice(1).join(' '));
      }
      setSpecialty(parts[1]);
    }
    setShowSuggestions(false);
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

  const getProviderRating = () => {
    return (Math.random() * 2 + 3).toFixed(1); // Mock rating between 3.0-5.0
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Enhanced NPI Registry Search
            <Badge className="ml-2" variant="secondary">500M+ Providers</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Type Toggle */}
          <div className="flex space-x-2">
            <Button
              variant={searchType === 'name' ? 'default' : 'outline'}
              onClick={() => setSearchType('name')}
              size="sm"
            >
              Name Search
            </Button>
            <Button
              variant={searchType === 'npi' ? 'default' : 'outline'}
              onClick={() => setSearchType('npi')}
              size="sm"
            >
              NPI Search
            </Button>
            <Button
              variant={searchType === 'advanced' ? 'default' : 'outline'}
              onClick={() => setSearchType('advanced')}
              size="sm"
            >
              <Filter className="w-4 h-4 mr-1" />
              Advanced
            </Button>
          </div>

          {/* Search Fields */}
          {(searchType === 'name' || searchType === 'advanced') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
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
                
                {/* Auto-suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1">
                    <Card className="shadow-lg">
                      <CardContent className="p-2">
                        {suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="p-2 hover:bg-muted cursor-pointer rounded text-sm"
                            onClick={() => handleSuggestionSelect(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}

          {searchType === 'npi' && (
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

          {searchType === 'advanced' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Popover open={showSpecialtyPopover} onOpenChange={setShowSpecialtyPopover}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {specialty || "Select specialty..."}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search specialties..." />
                      <CommandList>
                        <CommandEmpty>No specialty found.</CommandEmpty>
                        <CommandGroup>
                          {POPULAR_SPECIALTIES.map((spec) => (
                            <CommandItem
                              key={spec}
                              onSelect={() => {
                                setSpecialty(spec);
                                setShowSpecialtyPopover(false);
                              }}
                            >
                              {spec}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>State</Label>
                <Popover open={showStatePopover} onOpenChange={setShowStatePopover}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {state || "Select state..."}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search states..." />
                      <CommandList>
                        <CommandEmpty>No state found.</CommandEmpty>
                        <CommandGroup>
                          {STATES.map((st) => (
                            <CommandItem
                              key={st}
                              onSelect={() => {
                                setState(st);
                                setShowStatePopover(false);
                              }}
                            >
                              {st}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
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

      {/* Enhanced Search Results */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results ({searchResults.resultCount.toLocaleString()} found)
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
                  <Card key={provider.npi} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
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
                          <div className="flex-1">
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
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm ml-1">{getProviderRating()}</span>
                              </div>
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