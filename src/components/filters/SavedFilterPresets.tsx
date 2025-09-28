import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Filter, 
  Save, 
  Star, 
  Users, 
  Heart, 
  Activity,
  Calendar,
  AlertTriangle,
  Plus,
  X,
  Edit
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  filters: {
    riskLevel?: string[];
    conditions?: string[];
    ageRange?: { min: number; max: number };
    appointmentStatus?: string[];
    lastVisit?: string;
  };
  count: number;
  isDefault?: boolean;
  color: string;
}

interface SavedFilterPresetsProps {
  onFilterChange?: (filters: any) => void;
  currentFilters?: any;
}

const SavedFilterPresets: React.FC<SavedFilterPresetsProps> = ({
  onFilterChange,
  currentFilters = {},
}) => {
  const { toast } = useToast();
  const [presets, setPresets] = useState<FilterPreset[]>([
    {
      id: 'high-risk-diabetics',
      name: 'High-Risk Diabetics',
      description: 'Patients with diabetes and high risk scores',
      icon: <AlertTriangle className="h-4 w-4" />,
      filters: {
        riskLevel: ['high', 'critical'],
        conditions: ['diabetes', 'diabetic'],
      },
      count: 23,
      isDefault: true,
      color: 'border-l-destructive',
    },
    {
      id: 'cardiac-patients',
      name: 'Cardiac Patients',
      description: 'All patients with heart conditions',
      icon: <Heart className="h-4 w-4" />,
      filters: {
        conditions: ['hypertension', 'cardiac', 'heart'],
      },
      count: 45,
      color: 'border-l-red-500',
    },
    {
      id: 'recent-labs-abnormal',
      name: 'Abnormal Recent Labs',
      description: 'Patients with abnormal lab results in last 30 days',
      icon: <Activity className="h-4 w-4" />,
      filters: {
        lastVisit: 'last-30-days',
      },
      count: 12,
      color: 'border-l-warning',
    },
    {
      id: 'elderly-patients',
      name: 'Elderly Patients (65+)',
      description: 'Patients aged 65 and older',
      icon: <Users className="h-4 w-4" />,
      filters: {
        ageRange: { min: 65, max: 120 },
      },
      count: 78,
      color: 'border-l-blue-500',
    },
    {
      id: 'overdue-appointments',
      name: 'Overdue Appointments',
      description: 'Patients who missed scheduled appointments',
      icon: <Calendar className="h-4 w-4" />,
      filters: {
        appointmentStatus: ['missed', 'no-show'],
      },
      count: 8,
      color: 'border-l-orange-500',
    },
  ]);
  
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState('');

  const handleApplyPreset = (preset: FilterPreset) => {
    setActivePreset(preset.id);
    onFilterChange?.(preset.filters);
    
    toast({
      title: 'Filter Applied',
      description: `Applied "${preset.name}" filter - ${preset.count} patients`,
    });
  };

  const handleClearFilters = () => {
    setActivePreset(null);
    onFilterChange?.({});
    
    toast({
      title: 'Filters Cleared',
      description: 'All filters have been removed',
    });
  };

  const handleSaveCurrentFilter = () => {
    if (!newPresetName.trim()) return;
    
    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName,
      description: 'Custom filter preset',
      icon: <Filter className="h-4 w-4" />,
      filters: currentFilters,
      count: 0, // Would be calculated from actual data
      color: 'border-l-primary',
    };
    
    setPresets(prev => [...prev, newPreset]);
    setNewPresetName('');
    
    toast({
      title: 'Filter Saved',
      description: `Saved "${newPresetName}" as a new filter preset`,
    });
  };

  const handleDeletePreset = (presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
    if (activePreset === presetId) {
      setActivePreset(null);
      onFilterChange?.({});
    }
    
    toast({
      title: 'Filter Deleted',
      description: 'Filter preset has been removed',
    });
  };

  const handleRenamePreset = (presetId: string, newName: string) => {
    setPresets(prev =>
      prev.map(p =>
        p.id === presetId ? { ...p, name: newName } : p
      )
    );
    setEditingPreset(null);
    
    toast({
      title: 'Filter Renamed',
      description: `Filter renamed to "${newName}"`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Saved Filter Presets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant={activePreset === preset.id ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-2 ${preset.color} ${
                activePreset === preset.id ? 'border-l-4' : ''
              }`}
              onClick={() => handleApplyPreset(preset)}
            >
              {preset.icon}
              <span>{preset.name}</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {preset.count}
              </Badge>
              {preset.isDefault && (
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              )}
            </Button>
          ))}
        </div>

        {/* Active Filter Display */}
        {activePreset && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  Active: {presets.find(p => p.id === activePreset)?.name}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Preset Management */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Manage Presets</h4>
          
          {/* Save Current Filter */}
          <div className="flex gap-2">
            <Input
              placeholder="Name for current filter..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="text-sm"
            />
            <Button
              size="sm"
              onClick={handleSaveCurrentFilter}
              disabled={!newPresetName.trim()}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>

          {/* Preset List with Actions */}
          <div className="space-y-2">
            {presets.map((preset) => (
              <div key={preset.id} className={`p-3 rounded-lg border-l-4 ${preset.color} bg-muted/20`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {preset.icon}
                    {editingPreset === preset.id ? (
                      <Input
                        defaultValue={preset.name}
                        className="h-6 text-sm"
                        onBlur={(e) => handleRenamePreset(preset.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenamePreset(preset.id, e.currentTarget.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-sm">{preset.name}</span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {preset.count}
                    </Badge>
                    {preset.isDefault && (
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleApplyPreset(preset)}>
                        Apply Filter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingPreset(preset.id)}>
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeletePreset(preset.id)}
                        className="text-destructive"
                        disabled={preset.isDefault}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedFilterPresets;