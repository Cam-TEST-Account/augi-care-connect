import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates';
import { supabase } from '@/integrations/supabase/client';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  risk_level: string;
  created_at: string;
}

interface OptimisticPatientListProps {
  initialPatients?: Patient[];
}

const OptimisticPatientList: React.FC<OptimisticPatientListProps> = ({
  initialPatients = []
}) => {
  const [isAdding, setIsAdding] = useState(false);
  
  const {
    data: patients,
    optimisticAdd,
    optimisticUpdate,
    optimisticDelete,
    isPending,
    getError,
    clearError,
    retry,
  } = useOptimisticUpdates<Patient>(initialPatients, {
    onSuccess: () => console.log('Operation successful'),
    onError: (error, data) => console.error('Operation failed:', error, data),
  });

  const handleAddPatient = async () => {
    if (isAdding) return;
    setIsAdding(true);
    
    const newPatient: Patient = {
      id: '', // Will be set by optimistic update
      first_name: 'New',
      last_name: 'Patient',
      risk_level: 'low',
      created_at: new Date().toISOString(),
    };

    try {
      await optimisticAdd(
        newPatient,
        async () => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simulate occasional failure
          if (Math.random() < 0.3) {
            throw new Error('Network error');
          }
          
          const { data, error } = await supabase
            .from('patients')
            .insert({
              first_name: newPatient.first_name,
              last_name: newPatient.last_name,
              date_of_birth: '1990-01-01', // Required field
            })
            .select()
            .single();
          
          if (error) throw error;
          return data;
        }
      );
    } catch (error) {
      console.error('Failed to add patient:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateRisk = async (patientId: string, newRiskLevel: string) => {
    try {
      await optimisticUpdate(
        patientId,
        { risk_level: newRiskLevel },
        async () => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simulate occasional failure
          if (Math.random() < 0.2) {
            throw new Error('Update failed');
          }
          
          const { data, error } = await supabase
            .from('patients')
            .update({ risk_level: newRiskLevel as any })
            .eq('id', patientId)
            .select()
            .single();
          
          if (error) throw error;
          return data;
        }
      );
    } catch (error) {
      console.error('Failed to update patient:', error);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await optimisticDelete(
        patientId,
        async () => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Simulate occasional failure
          if (Math.random() < 0.25) {
            throw new Error('Delete failed');
          }
          
          const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', patientId);
          
          if (error) throw error;
        }
      );
    } catch (error) {
      console.error('Failed to delete patient:', error);
    }
  };

  const getRiskColor = (risk: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (risk) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const renderPatientCard = (patient: Patient) => {
    const pending = isPending(patient.id);
    const error = getError(patient.id);
    
    return (
      <Card key={patient.id} className={`transition-all ${pending ? 'opacity-60' : ''} ${error ? 'border-destructive/50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {patient.first_name[0]}{patient.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">
                  {patient.first_name} {patient.last_name}
                  {pending && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getRiskColor(patient.risk_level)}>
                    {patient.risk_level} risk
                  </Badge>
                  {error && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {error ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearError(patient.id);
                    // You could implement retry logic here
                  }}
                >
                  Retry
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateRisk(
                      patient.id, 
                      patient.risk_level === 'low' ? 'high' : 'low'
                    )}
                    disabled={pending}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePatient(patient.id)}
                    disabled={pending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mt-3 p-2 bg-destructive/10 rounded text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Optimistic Updates Demo</span>
            <Button onClick={handleAddPatient} disabled={isAdding}>
              {isAdding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Patient
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This demonstrates optimistic updates - changes appear instantly while being saved in the background. 
            Try adding, editing, or deleting patients to see the smooth UX.
          </p>
          
          {patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No patients yet. Add one to see optimistic updates in action!
            </div>
          ) : (
            <div className="grid gap-3">
              {patients.map(renderPatientCard)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimisticPatientList;