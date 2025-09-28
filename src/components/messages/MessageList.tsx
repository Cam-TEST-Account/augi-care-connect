import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  subject: string;
  message_body: string;
  created_at: string;
  is_read: boolean;
  is_urgent: boolean;
  sender_provider_id: string;
  recipient_provider_id: string;
  patient_id: string;
  patients: {
    first_name: string;
    last_name: string;
    mrn?: string;
  };
  sender_provider: {
    first_name: string;
    last_name: string;
    specialty?: string;
  };
  recipient_provider: {
    first_name: string;
    last_name: string;
    specialty?: string;
  };
}

interface MessageListProps {
  selectedMessageId?: string;
  onSelectMessage: (message: Message) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  selectedMessageId,
  onSelectMessage
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'secure_messages'
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current user's provider profile
      const { data: providerProfile, error: profileError } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch messages where user is sender or recipient
      const { data, error } = await supabase
        .from('secure_messages')
        .select(`
          id,
          subject,
          message_body,
          created_at,
          is_read,
          is_urgent,
          sender_provider_id,
          recipient_provider_id,
          patient_id,
          patients!inner (
            first_name,
            last_name,
            mrn
          ),
          sender_provider:provider_profiles!sender_provider_id (
            first_name,
            last_name,
            specialty
          ),
          recipient_provider:provider_profiles!recipient_provider_id (
            first_name,
            last_name,
            specialty
          )
        `)
        .or(`sender_provider_id.eq.${providerProfile.id},recipient_provider_id.eq.${providerProfile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(data as Message[] || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('secure_messages')
        .update({ 
          is_read: true,
          read_date: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_read: true }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSelectMessage = (message: Message) => {
    if (!message.is_read) {
      markAsRead(message.id);
    }
    onSelectMessage(message);
  };

  const filteredMessages = messages.filter(message => 
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.patients.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.patients.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender_provider.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender_provider.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Messages</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{unreadCount} unread</Badge>
            <Button variant="outline" size="sm" onClick={fetchMessages}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search messages..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0 max-h-[600px] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {searchTerm ? 'No messages found matching your search.' : 'No messages yet.'}
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                  selectedMessageId === message.id ? 'bg-muted' : ''
                }`}
                onClick={() => handleSelectMessage(message)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {message.patients.first_name[0]}{message.patients.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium truncate ${!message.is_read ? 'font-bold' : ''}`}>
                        {message.patients.first_name} {message.patients.last_name}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {!message.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                        {message.is_urgent && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        From: {message.sender_provider.first_name} {message.sender_provider.last_name}
                      </span>
                      {message.sender_provider.specialty && (
                        <Badge variant="outline" className="text-xs">
                          {message.sender_provider.specialty}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm truncate ${!message.is_read ? 'font-semibold' : 'text-muted-foreground'}`}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};