import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  Archive, 
  Send, 
  Paperclip, 
  Shield, 
  AlertCircle,
  Reply
} from 'lucide-react';
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

interface MessageDetailProps {
  message: Message | null;
  onRefresh: () => void;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  onRefresh
}) => {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleReply = async () => {
    if (!message || !replyText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a reply message",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current user's provider profile
      const { data: senderProfile, error: profileError } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Send reply
      const { error: messageError } = await supabase
        .from('secure_messages')
        .insert({
          patient_id: message.patient_id,
          sender_provider_id: senderProfile.id,
          recipient_provider_id: message.sender_provider_id,
          subject: `Re: ${message.subject}`,
          message_body: replyText.trim(),
          is_urgent: false,
          message_type: 'clinical',
          parent_message_id: message.id
        });

      if (messageError) throw messageError;

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully",
      });

      setReplyText('');
      setIsReplying(false);
      onRefresh();
      
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!message) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>Select a message to view details</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                {message.patients.first_name[0]}{message.patients.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">
                {message.patients.first_name} {message.patients.last_name}
              </h3>
              <div className="flex items-center space-x-2">
                {message.patients.mrn && (
                  <Badge variant="outline" className="text-xs">MRN: {message.patients.mrn}</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  From: {message.sender_provider.first_name} {message.sender_provider.last_name}
                </span>
                {message.sender_provider.specialty && (
                  <Badge variant="outline" className="text-xs">
                    {message.sender_provider.specialty}
                  </Badge>
                )}
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

      {/* Message Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Message Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-foreground">{message.subject}</h4>
              {message.is_urgent && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
            </span>
          </div>

          {/* Message Body */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="whitespace-pre-wrap text-sm text-foreground">
              {message.message_body}
            </div>
          </div>

          {/* Reply Section */}
          {isReplying && (
            <div className="space-y-3 border-t pt-4">
              <h5 className="font-medium text-foreground">Reply to this message:</h5>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground">
                {replyText.length}/5000 characters
              </p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleReply}
                  disabled={isSending || !replyText.trim()}
                >
                  {isSending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t border-border p-4">
        {!isReplying ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsReplying(true)}
              >
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </Button>
              <Button variant="outline" size="sm">
                <Paperclip className="w-4 h-4 mr-2" />
                Attach
              </Button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              HIPAA compliant & encrypted
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground flex items-center justify-center">
            <Shield className="w-3 h-3 mr-1" />
            All messages are encrypted and HIPAA compliant
          </p>
        )}
      </div>
    </Card>
  );
};