import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Search, 
  Plus,
  Clock,
  Send,
  Paperclip,
  Star,
  Archive,
  Shield
} from 'lucide-react';

const conversations = [
  {
    id: 1,
    patient: 'Emily Rodriguez',
    lastMessage: 'Thank you for adjusting my medication. The new dosage is working much better.',
    timestamp: '2 hours ago',
    unread: 2,
    priority: 'normal',
    avatar: '/placeholder-patient1.jpg',
    ehrSystem: 'Epic MyChart'
  },
  {
    id: 2,
    patient: 'Michael Thompson',
    lastMessage: 'I have some concerns about the upcoming procedure. Can we schedule a call?',
    timestamp: '4 hours ago',
    unread: 1,
    priority: 'high',
    avatar: '/placeholder-patient2.jpg',
    ehrSystem: 'Cerner'
  },
  {
    id: 3,
    patient: 'Sarah Williams',
    lastMessage: 'Lab results look good. When should I schedule my next appointment?',
    timestamp: 'Yesterday',
    unread: 0,
    priority: 'normal',
    avatar: '/placeholder-patient3.jpg',
    ehrSystem: 'Athena'
  }
];

const Messages = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Secure Messages</h1>
            <p className="text-muted-foreground">HIPAA-compliant patient communication across all EHR systems</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conversations</CardTitle>
                  <Badge variant="outline">8 unread</Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search messages..." 
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {conversations.map((conversation) => (
                    <div 
                      key={conversation.id}
                      className="p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>{conversation.patient.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground truncate">{conversation.patient}</h4>
                            {conversation.unread > 0 && (
                              <Badge variant="default" className="text-xs">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs">{conversation.ehrSystem}</Badge>
                            {conversation.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs">High Priority</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                          <p className="text-xs text-muted-foreground mt-1">{conversation.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="/placeholder-patient1.jpg" />
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">Emily Rodriguez</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">Epic MyChart</Badge>
                        <span className="text-xs text-muted-foreground">Last seen 2 hours ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* Patient Message */}
                <div className="flex justify-start">
                  <div className="max-w-[70%] bg-muted p-3 rounded-lg">
                    <p className="text-sm text-foreground">Hi Dr. Chen, I wanted to follow up on our last appointment. The new medication you prescribed is working really well. My blood pressure readings have been much more stable.</p>
                    <p className="text-xs text-muted-foreground mt-2">Yesterday, 3:45 PM</p>
                  </div>
                </div>

                {/* Provider Response */}
                <div className="flex justify-end">
                  <div className="max-w-[70%] bg-primary text-primary-foreground p-3 rounded-lg">
                    <p className="text-sm">That's excellent news, Emily! I'm glad to hear the medication is working well for you. Please continue monitoring your blood pressure and let me know if you have any concerns.</p>
                    <p className="text-xs text-primary-foreground/70 mt-2">Yesterday, 4:12 PM</p>
                  </div>
                </div>

                {/* Patient Latest Message */}
                <div className="flex justify-start">
                  <div className="max-w-[70%] bg-muted p-3 rounded-lg">
                    <p className="text-sm text-foreground">Thank you for adjusting my medication. The new dosage is working much better. Should I schedule my next appointment for the usual 3-month follow-up?</p>
                    <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input 
                    placeholder="Type your secure message..." 
                    className="flex-1"
                  />
                  <Button size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  All messages are encrypted and HIPAA compliant
                </p>
              </div>
            </Card>
          </div>
        </div>

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