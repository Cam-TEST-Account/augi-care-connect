import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Copy, 
  Search, 
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BiomarkerData {
  name: string;
  value: string;
  unit: string;
  status: 'needs_attention' | 'improving' | 'on_the_rise' | 'okay' | 'good';
  timeAgo: string;
  trend: number[];
}

interface WearableData {
  name: string;
  value: string;
  subtext: string;
  status: 'improving' | 'stable' | 'declining';
}

interface PatientDetailViewProps {
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    mrn?: string;
    risk_level?: string;
    last_visit_date?: string;
  };
}

const mockBiomarkers: BiomarkerData[] = [
  { name: 'LDL-C', value: '118', unit: 'mg/dL', status: 'needs_attention', timeAgo: '7d ago', trend: [50, 55, 60, 52, 58, 65] },
  { name: 'A1-C', value: '5.4', unit: '%', status: 'improving', timeAgo: '30d ago', trend: [70, 65, 60, 55, 50, 45] },
  { name: 'hsCRP', value: '2.55', unit: 'mg/L', status: 'on_the_rise', timeAgo: '7d ago', trend: [30, 35, 40, 45, 50, 55] },
  { name: 'HDL', value: '43', unit: 'mg/dL', status: 'okay', timeAgo: '7d ago', trend: [45, 48, 42, 44, 43, 45] },
  { name: 'TSH', value: '1.91', unit: '/mL', status: 'good', timeAgo: '30d ago', trend: [60, 55, 50, 48, 45, 42] },
  { name: 'ApoB', value: '92', unit: 'mg/L', status: 'needs_attention', timeAgo: '7d ago', trend: [40, 50, 55, 60, 70, 75] },
];

const mockWearables: WearableData[] = [
  { name: 'RHR', value: '68', subtext: '2w avg', status: 'improving' },
  { name: 'HRV', value: '41', subtext: '2w avg', status: 'stable' },
  { name: 'Sleep', value: '8.2h', subtext: '2w avg', status: 'improving' },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'needs_attention':
      return { label: 'NEEDS ATTENTION', bgColor: 'bg-red-100', textColor: 'text-red-700', dotColor: 'bg-red-500' };
    case 'improving':
      return { label: 'IMPROVING', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', dotColor: 'bg-yellow-500' };
    case 'on_the_rise':
      return { label: 'ON THE RISE', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', dotColor: 'bg-yellow-500' };
    case 'okay':
      return { label: 'OKAY', bgColor: 'bg-green-100', textColor: 'text-green-700', dotColor: 'bg-green-500' };
    case 'good':
      return { label: 'GOOD', bgColor: 'bg-green-100', textColor: 'text-green-700', dotColor: 'bg-green-500' };
    default:
      return { label: 'UNKNOWN', bgColor: 'bg-gray-100', textColor: 'text-gray-700', dotColor: 'bg-gray-500' };
  }
};

const MiniSparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#4B5563' }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 40;
  const padding = 4;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="3"
            fill={color}
          />
        );
      })}
    </svg>
  );
};

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [biomarkerSearch, setBiomarkerSearch] = useState('');
  const { toast } = useToast();

  const patientData = patient || {
    first_name: 'Gianna',
    last_name: 'Brown',
    date_of_birth: '1993-01-06',
    mrn: '12402013',
    risk_level: 'high',
    last_visit_date: '2024-10-10',
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDOB = (dob: string) => {
    return new Date(dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const copyMRN = () => {
    navigator.clipboard.writeText(patientData.mrn || '');
    toast({ title: 'MRN copied to clipboard' });
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Patient Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-start justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 bg-augi-sage/20">
              <AvatarFallback className="bg-augi-sage/30 text-augi-forest font-semibold text-lg">
                {getInitials(patientData.first_name, patientData.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">
                  {patientData.first_name} {patientData.last_name}
                </h1>
                <span className="text-muted-foreground">MRN:</span>
                <button 
                  onClick={copyMRN}
                  className="flex items-center gap-1 bg-augi-forest text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-augi-forest/90 transition-colors"
                >
                  {patientData.mrn}
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground text-sm">
                  {formatDOB(patientData.date_of_birth)} • {calculateAge(patientData.date_of_birth)}
                </span>
                <span className="text-muted-foreground">•</span>
                <Badge className="bg-augi-sage text-white hover:bg-augi-sage/90">ASCVD History</Badge>
                <Badge className="bg-augi-coral text-white hover:bg-augi-coral/90">Cardiac Risk</Badge>
                <Badge className="bg-augi-coral text-white hover:bg-augi-coral/90">Allergies: Buprenorphine</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Primary Care Provider</p>
            <p className="font-medium text-foreground">Dr. S. Green MD at Columbia Doctors</p>
            <p className="text-sm text-muted-foreground">Last visit: {patientData.last_visit_date ? new Date(patientData.last_visit_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }) : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Content - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Summary */}
            <Card className="border border-border bg-white shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-augi-forest mb-4">AI Summary</h2>
                <div className="space-y-3 text-foreground leading-relaxed">
                  <p>
                    {patientData.first_name}, {calculateAge(patientData.date_of_birth)}yo female with family history of ASCVD and Type 2 Diabetes.
                  </p>
                  <p>
                    Recent wearable data suggests an increase in VO2 max, and HRV averages need attention but trending upwards.
                  </p>
                  <p>
                    Last blood panel 7d ago continues to be consistent with an at-risk cardiovascular disease profile.
                  </p>
                  <p>
                    Discuss starting <span className="text-augi-forest underline cursor-pointer">COQ10</span> or similar supplements, <span className="text-augi-forest underline cursor-pointer">increased zone 2 activity to 90 minutes per week</span>, and monitor <span className="text-augi-forest underline cursor-pointer">advanced biomarkers</span> closely before exploring early low-dose statin protocol
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Biomarkers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-augi-forest">Key Biomarkers</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search" 
                    value={biomarkerSearch}
                    onChange={(e) => setBiomarkerSearch(e.target.value)}
                    className="pl-9 w-40 h-9 bg-white border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockBiomarkers.map((biomarker, index) => {
                  const config = getStatusConfig(biomarker.status);
                  return (
                    <Card key={index} className="border border-border bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${config.bgColor} ${config.textColor} text-xs font-medium px-2 py-0.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} mr-1.5 inline-block`}></span>
                            {config.label}
                          </Badge>
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-lg font-semibold text-foreground">{biomarker.name}</p>
                            <p className="text-2xl font-bold text-foreground">
                              {biomarker.value}<span className="text-sm font-normal text-muted-foreground">{biomarker.unit}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{biomarker.timeAgo}</p>
                          </div>
                          <MiniSparkline data={biomarker.trend} color="#4B5563" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Wearable Data */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-augi-forest">Wearable data</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search" 
                    className="pl-9 w-40 h-9 bg-white border-border"
                  />
                </div>
              </div>
              <Card className="border border-border bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 inline-block"></span>
                      IMPROVING
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    {mockWearables.map((wearable, index) => (
                      <div key={index} className="text-center">
                        <p className="text-lg font-semibold text-foreground">{wearable.name}</p>
                        <p className="text-3xl font-bold text-foreground">{wearable.value}</p>
                        <p className="text-xs text-muted-foreground">{wearable.subtext}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Medications */}
            <Card className="border border-border bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-augi-coral">Medications</h3>
                  <Search className="w-4 h-4 text-augi-coral cursor-pointer" />
                </div>
                <p className="text-muted-foreground text-sm">Current: None</p>
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card className="border border-border bg-white shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Allergies</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Medication:</span> Buprenorphine</p>
                  <p><span className="text-muted-foreground">Environmental:</span> Dust, Pollen, Seasonal</p>
                </div>
              </CardContent>
            </Card>

            {/* Supplements */}
            <Card className="border border-border bg-white shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Supplements</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-foreground">Vitamin D</p>
                      <p className="text-sm text-muted-foreground">10,000 IU</p>
                      <p className="text-xs text-muted-foreground">1x / 10 week protocol</p>
                      <p className="text-xs text-augi-forest underline cursor-pointer">Naturemade Vit...</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Multivitamin</p>
                      <p className="text-sm text-muted-foreground">N/A</p>
                      <p className="text-xs text-muted-foreground">2x daily</p>
                      <p className="text-xs text-augi-forest underline cursor-pointer">Thorne Basic Nut...</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-foreground">NAD+</p>
                      <p className="text-sm text-muted-foreground">550mg</p>
                      <p className="text-xs text-muted-foreground">2x daily</p>
                      <p className="text-xs text-augi-forest underline cursor-pointer">Cata-Kor Liposomal...</p>
                    </div>
                    <div>
                      <Badge className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 inline-block"></span>
                        RECOMMENDATION
                      </Badge>
                      <p className="font-medium text-foreground">COQ10</p>
                      <p className="text-sm text-muted-foreground">100mg</p>
                      <p className="text-xs text-muted-foreground">1x daily</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search Bar at Bottom */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder={`Search ${patientData.first_name}'s records or ask a question`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-24 h-14 rounded-full border-2 border-augi-sage/50 bg-white text-base shadow-md focus:border-augi-sage focus:ring-augi-sage"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="w-8 h-8 rounded-full bg-augi-sage flex items-center justify-center hover:bg-augi-sage/90 transition-colors">
                <Plus className="w-4 h-4 text-white" />
              </button>
              <button className="w-8 h-8 rounded-full bg-augi-sage flex items-center justify-center hover:bg-augi-sage/90 transition-colors">
                <MoreHorizontal className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
