import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Send, 
  Copy, 
  Check,
  Smartphone,
  QrCode,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import augiLogo from '@/assets/augi-logo.png';

interface InvitePatientDialogProps {
  trigger?: React.ReactNode;
}

export const InvitePatientDialog: React.FC<InvitePatientDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    "Hi! I'd like to invite you to use Augi - a free app that helps you organize and share your health records with your care team. It makes our appointments more efficient and helps me provide better care. Download it here:"
  );
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const inviteLink = 'https://getaugi.com/invite?ref=provider';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({ title: 'Invite link copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = () => {
    if (!email && !phone) {
      toast({ 
        title: 'Please enter email or phone', 
        variant: 'destructive' 
      });
      return;
    }
    
    toast({ 
      title: 'Invitation sent!',
      description: `Your patient will receive an invite to join Augi.`
    });
    setOpen(false);
    setEmail('');
    setPhone('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-augi-sage hover:bg-augi-sage/90 text-white gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Patients to Augi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <img src={augiLogo} alt="Augi" className="w-10 h-10 rounded-lg" />
            <div>
              <DialogTitle className="text-xl">Invite Your Patients to Augi</DialogTitle>
              <Badge className="bg-green-100 text-green-700 mt-1">FREE for patients</Badge>
            </div>
          </div>
          <DialogDescription className="text-left">
            Help your patients prepare for appointments by having them share their health history through Augi. 
            It's free for patients and saves time during visits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Benefits */}
          <div className="bg-augi-cream rounded-lg p-4">
            <h4 className="font-medium text-augi-forest mb-2">Why invite patients to Augi?</h4>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-augi-sage mt-0.5 flex-shrink-0" />
                Pre-appointment prep with complete health history
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-augi-sage mt-0.5 flex-shrink-0" />
                Access to wearable data, biomarkers, and medications
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-augi-sage mt-0.5 flex-shrink-0" />
                AI-powered summaries save consultation time
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-augi-sage mt-0.5 flex-shrink-0" />
                Perfect for urgent care, therapy, and concierge practices
              </li>
            </ul>
          </div>

          {/* Invite Methods */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="patient@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personalized Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button 
              onClick={handleSendInvite}
              className="flex-1 bg-augi-forest hover:bg-augi-forest/90 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCopyLink}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </Button>
            <Button variant="outline" size="icon" title="Show QR Code">
              <QrCode className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Patients download the Augi app and share their longitudinal health data with you securely.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
