import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewMessageDialog } from '@/components/messages/NewMessageDialog';
import { MessageList } from '@/components/messages/MessageList';
import { MessageDetail } from '@/components/messages/MessageDetail';
import { 
  MessageSquare, 
  Plus,
  Paperclip,
  Star,
  Shield
} from 'lucide-react';

const Messages = () => {
  const location = useLocation();
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get patient or provider data from navigation
  const selectedPatient = location.state?.selectedPatient;
  const provider = location.state?.provider;
  const patient = location.state?.patient;

  // Open new message dialog if we have a preselected patient
  useEffect(() => {
    if (selectedPatient || (provider && patient)) {
      setShowNewMessage(true);
    }
  }, [selectedPatient, provider, patient]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Secure Messages</h1>
            <p className="text-muted-foreground">
              HIPAA-compliant patient communication across all EHR systems
              {selectedPatient && ` - New message to ${selectedPatient.name}`}
              {provider && patient && ` - New message between ${provider.name} and ${patient.name}`}
            </p>
          </div>
          <Button onClick={() => setShowNewMessage(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1">
            <MessageList 
              key={refreshKey}
              selectedMessageId={selectedMessage?.id}
              onSelectMessage={setSelectedMessage}
            />
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            <MessageDetail 
              message={selectedMessage}
              onRefresh={handleRefresh}
            />
          </div>
        </div>

        {/* New Message Dialog */}
        <NewMessageDialog 
          open={showNewMessage}
          onOpenChange={setShowNewMessage}
          preselectedPatientId={selectedPatient?.id || patient?.id}
        />

        {/* Message Features */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features">Platform Features</TabsTrigger>
            <TabsTrigger value="cross-ehr">Cross-EHR Communication</TabsTrigger>
            <TabsTrigger value="compliance">Security & Compliance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Real-time Messaging</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Instant delivery with read receipts and typing indicators.</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Paperclip className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">File Sharing</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Securely share lab results, images, and documents.</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Priority Messaging</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Flag urgent messages for immediate attention.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="cross-ehr" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cross-EHR Provider Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Unified Care Team Messaging</h4>
                    <p className="text-sm text-muted-foreground">Connect providers from different EHR systems (Epic, Cerner, Athena) in the same patient conversation thread.</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Automatic EHR Sync</h4>
                    <p className="text-sm text-muted-foreground">Messages automatically sync back to each provider's native EHR system for complete documentation.</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Patient-Controlled Permissions</h4>
                    <p className="text-sm text-muted-foreground">Patients can invite and manage which providers have access to their unified communication thread.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-primary" />
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'End-to-end encryption for all messages',
                      'Secure file transfer with virus scanning',
                      'Message expiration and deletion controls',
                      'Audit logs for all communications',
                      'Two-factor authentication required'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Standards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'HIPAA compliant messaging platform',
                      'SOC 2 Type II certified infrastructure',
                      'Business Associate Agreement coverage',
                      'Regular security audits and assessments',
                      'GDPR compliant data handling'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Messages;