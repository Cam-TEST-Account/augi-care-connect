import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Search, 
  Plus,
  ChevronDown,
  Command
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import CommandPalette from '@/components/ui/command-palette';
import { useNotifications } from '@/hooks/useNotifications';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { getUserDisplayInfo } from '@/utils/userUtils';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { notifications, markAsRead, dismiss, markAllAsRead } = useNotifications();
  const { open, setOpen } = useCommandPalette();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userInfo = getUserDisplayInfo(user);

  return (
    <header className="floating-panel border-b-0 backdrop-blur-2xl sticky top-0 z-50 h-16 px-6 flex items-center justify-between animate-slide-up">
      {/* Enhanced Search with Quick Actions */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Input 
            placeholder="Search patients, records, providers..." 
            className="pl-10 pr-32 enhanced-search-input"
            onClick={() => setOpen(true)}
            readOnly
          />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setOpen(true)}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors h-8 px-3"
          >
            <Command className="h-3 w-3 mr-1" />
            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Button variant="glass" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Patient
        </Button>
        
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onDismiss={dismiss}
          onMarkAllAsRead={markAllAsRead}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>{userInfo.initials}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">{userInfo.displayName}</p>
                <p className="text-xs text-muted-foreground">{userInfo.specialty}</p>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="floating-panel border-0 mt-2" align="end">
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/security')}>Audit Log</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <CommandPalette open={open} onOpenChange={setOpen} />
    </header>
  );
};