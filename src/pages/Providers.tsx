import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NPISearch } from '@/components/providers/NPISearch';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MapPin, 
  Star,
  DollarSign,
  Clock,
  Phone,
  Calendar,
  Filter,
  Users,
  Award,
  Building,
  Shield
} from 'lucide-react';

const providers = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiology',
    rating: 4.9,
    reviews: 127,
    distance: '2.3 miles',
    insuranceAccepted: ['Aetna', 'Blue Cross', 'UnitedHealth'],
    npi: '1234567890',
    copay: '$25',
    nextAvailable: 'Tomorrow 2:00 PM',
    avatar: '/placeholder-doctor1.jpg',
    practice: 'Heart Care Center',
    ehrSystem: 'Epic MyChart'
  },
  {
    id: 2,
    name: 'Dr. Michael Roberts',
    specialty: 'Endocrinology',
    rating: 4.8,
    reviews: 89,
    distance: '1.7 miles',
    insuranceAccepted: ['Cigna', 'Humana', 'Blue Cross'],
    npi: '0987654321',
    copay: '$30',
    nextAvailable: 'Next Week',
    avatar: '/placeholder-doctor2.jpg',
    practice: 'Diabetes & Endocrine Associates',
    ehrSystem: 'Athena'
  },
  {
    id: 3,
    name: 'Dr. Jennifer Lee',
    specialty: 'Primary Care',
    rating: 4.7,
    reviews: 203,
    distance: '3.1 miles',
    insuranceAccepted: ['Kaiser', 'Blue Cross', 'Aetna'],
    npi: '1122334455',
    copay: '$20',
    nextAvailable: 'Today 4:30 PM',
    avatar: '/placeholder-doctor3.jpg',
    practice: 'Community Health Partners',
    ehrSystem: 'Cerner'
  }
];

const ProviderCard = ({ provider }: { provider: typeof providers[0] }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBookAppointment = () => {
    navigate('/appointments', { state: { provider } });
    toast({
      title: 'Booking Appointment',
      description: `Opening scheduler for ${provider.name}`,
    });
  };

  const handleCallOffice = () => {
    toast({
      title: 'Calling Office',
      description: `Dialing ${provider.practice} office...`,
    });
  };

  const handleViewProfile = () => {
    toast({
      title: 'Provider Profile',
      description: `Opening detailed profile for ${provider.name}`,
    });
  };

  return (
    <Card className="hover:shadow-soft transition-all">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={provider.avatar} />
            <AvatarFallback>{provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{provider.name}</h3>
                <p className="text-muted-foreground">{provider.specialty}</p>
                <p className="text-sm text-muted-foreground">{provider.practice}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center mb-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 font-medium">{provider.rating}</span>
                  <span className="text-sm text-muted-foreground ml-1">({provider.reviews})</span>
                </div>
                <Badge variant="outline" className="text-xs">{provider.ehrSystem}</Badge>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
                <span>{provider.distance}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-muted-foreground mr-2" />
                <span>{provider.copay} copay</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                <span>{provider.nextAvailable}</span>
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 text-muted-foreground mr-2" />
                <span>NPI: {provider.npi}</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Accepts Insurance:</p>
              <div className="flex flex-wrap gap-2">
                {provider.insuranceAccepted.map((insurance) => (
                  <Badge key={insurance} variant="secondary" className="text-xs">
                    {insurance}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <Button size="sm" onClick={handleBookAppointment}>
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
              <Button variant="outline" size="sm" onClick={handleCallOffice}>
                <Phone className="w-4 h-4 mr-2" />
                Call Office
              </Button>
              <Button variant="outline" size="sm" onClick={handleViewProfile}>
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Providers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [insuranceTerm, setInsuranceTerm] = useState('');

  const handleAdvancedFilters = () => {
    toast({
      title: 'Advanced Filters',
      description: 'Opening provider search filters...',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Provider Search</h1>
            <p className="text-muted-foreground">Find in-network providers with real-time availability and cost transparency</p>
          </div>
          <Button onClick={handleAdvancedFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>

        {/* Search Section */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search by specialty, condition, or provider name..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Location or ZIP code..." 
                  className="pl-10"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Insurance plan..." 
                  className="pl-10"
                  value={insuranceTerm}
                  onChange={(e) => setInsuranceTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Results */}
        <Tabs defaultValue="search-results" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search-results">Search Results</TabsTrigger>
            <TabsTrigger value="npi-directory">NPI Directory</TabsTrigger>
            <TabsTrigger value="insurance-plans">Insurance Plans</TabsTrigger>
            <TabsTrigger value="cost-transparency">Cost Transparency</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search-results" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Found {providers.length} providers in your area</p>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Sort by:</span>
                <Button variant="ghost" size="sm">Distance</Button>
                <Button variant="ghost" size="sm">Rating</Button>
                <Button variant="ghost" size="sm">Cost</Button>
              </div>
            </div>
            <div className="space-y-4">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="npi-directory" className="space-y-4">
            <NPISearch />
          </TabsContent>

          <TabsContent value="insurance-plans" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supported Insurance Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Blue Cross Blue Shield', providers: '1,240', status: 'Active' },
                      { name: 'UnitedHealthcare', providers: '1,156', status: 'Active' },
                      { name: 'Aetna', providers: '892', status: 'Active' },
                      { name: 'Cigna', providers: '734', status: 'Active' },
                      { name: 'Humana', providers: '567', status: 'Active' },
                      { name: 'Kaiser Permanente', providers: '423', status: 'Active' }
                    ].map((plan) => (
                      <div key={plan.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">{plan.providers} in-network providers</p>
                        </div>
                        <Badge variant="default">{plan.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Real-time Eligibility</h4>
                      <p className="text-sm text-muted-foreground">Instant verification of patient insurance eligibility and benefits through Availity and Change Healthcare APIs.</p>
                    </div>
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Benefits Summary</h4>
                      <p className="text-sm text-muted-foreground">Detailed breakdown of copays, deductibles, and coverage limits for specific procedures.</p>
                    </div>
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Prior Authorization</h4>
                      <p className="text-sm text-muted-foreground">Automated prior authorization checking and submission for covered services.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cost-transparency" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">$125</p>
                  <p className="text-sm text-muted-foreground">Avg. Office Visit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">87%</p>
                  <p className="text-sm text-muted-foreground">Price Transparency</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">100%</p>
                  <p className="text-sm text-muted-foreground">Insurance Verified</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cost Transparency Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Procedure Cost Estimates</h4>
                      <p className="text-sm text-muted-foreground">Real-time cost estimates for common procedures based on your specific insurance plan.</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Network Status Impact</h4>
                      <p className="text-sm text-muted-foreground">Clear indication of how in-network vs out-of-network status affects your costs.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Payment Options</h4>
                      <p className="text-sm text-muted-foreground">Information on payment plans, cash pay discounts, and financial assistance programs.</p>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Quality Metrics</h4>
                      <p className="text-sm text-muted-foreground">Provider quality scores and patient outcomes data to inform cost vs. quality decisions.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Providers;