import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Search, X, AlertCircle } from 'lucide-react';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  mrn?: string;
}

interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  specialty?: string;
  email: string;
}

interface NewMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedPatientId?: string;
}

export const NewMessageDialog: React.FC<NewMessageDialogProps> = ({
  open,
  onOpenChange,
  preselectedPatientId
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Provider | null>(null);
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [searchProvider, setSearchProvider] = useState('');
  
  const { toast } = useToast();

  // Fetch patients and providers on mount
  useEffect(() => {
    if (open) {
      fetchPatients();
      fetchProviders();
    }
  }, [open]);

  // Set preselected patient
  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      const patient = patients.find(p => p.id === preselectedPatientId);
      if (patient) {
        setSelectedPatient(patient);
      }
    }
  }, [preselectedPatientId, patients]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, mrn')
        .limit(50);
      
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive"
      });
    }
  };

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('id, first_name, last_name, specialty, email')
        .eq('is_active', true)
        .limit(50);
      
      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load providers",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedPatient || !selectedRecipient || !subject.trim() || !messageBody.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current user's provider profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: senderProfile, error: profileError } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Insert the message
      const { error: messageError } = await supabase
        .from('secure_messages')
        .insert({
          patient_id: selectedPatient.id,
          sender_provider_id: senderProfile.id,
          recipient_provider_id: selectedRecipient.id,
          subject: subject.trim(),
          message_body: messageBody.trim(),
          is_urgent: isUrgent,
          message_type: 'clinical'
        });

      if (messageError) throw messageError;

      toast({
        title: "Message Sent",
        description: `Message sent to ${selectedRecipient.first_name} ${selectedRecipient.last_name}`,
      });

      // Reset form
      setSelectedPatient(null);
      setSelectedRecipient(null);
      setSubject('');
      setMessageBody('');
      setIsUrgent(false);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchPatient.toLowerCase()) ||
    patient.mrn?.toLowerCase().includes(searchPatient.toLowerCase())
  );

  const filteredProviders = providers.filter(provider => 
    `${provider.first_name} ${provider.last_name}`.toLowerCase().includes(searchProvider.toLowerCase()) ||
    provider.specialty?.toLowerCase().includes(searchProvider.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Secure Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                    {selectedPatient.mrn && (
                      <p className="text-sm text-muted-foreground">MRN: {selectedPatient.mrn}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients by name or MRN..."
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchPatient && (
                  <div className="max-h-32 overflow-y-auto border rounded-lg">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setSearchPatient('');
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {patient.first_name[0]}{patient.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                            {patient.mrn && (
                              <p className="text-sm text-muted-foreground">MRN: {patient.mrn}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Provider/Recipient Selection */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Send to Provider *</Label>
            {selectedRecipient ? (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {selectedRecipient.first_name[0]}{selectedRecipient.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedRecipient.first_name} {selectedRecipient.last_name}</p>
                    {selectedRecipient.specialty && (
                      <p className="text-sm text-muted-foreground">{selectedRecipient.specialty}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRecipient(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search providers by name or specialty..."
                    value={searchProvider}
                    onChange={(e) => setSearchProvider(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchProvider && (
                  <div className="max-h-32 overflow-y-auto border rounded-lg">
                    {filteredProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setSelectedRecipient(provider);
                          setSearchProvider('');
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {provider.first_name[0]}{provider.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{provider.first_name} {provider.last_name}</p>
                            {provider.specialty && (
                              <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject..."
              maxLength={200}
            />
          </div>

          {/* Message Body */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Type your secure message..."
              rows={5}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground">
              {messageBody.length}/5000 characters
            </p>
          </div>

          {/* Priority Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="urgent"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="urgent" className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 text-destructive" />
              Mark as urgent
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !selectedPatient || !selectedRecipient || !subject.trim() || !messageBody.trim()}
            >
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};