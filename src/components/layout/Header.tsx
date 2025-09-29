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
import { SidebarTrigger } from '@/components/ui/sidebar';

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
    <header className="bg-provider-green text-white border-b-0 backdrop-blur-2xl sticky top-0 z-50 h-14 sm:h-16 px-3 sm:px-4 md:px-6 flex items-center justify-between animate-slide-up shadow-lg">
      {/* Mobile Sidebar Trigger and Search */}
      <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
        {/* Mobile Sidebar Trigger */}
        <SidebarTrigger className="md:hidden" />
        
        {/* Enhanced Search with Quick Actions */}
        <div className="flex-1 max-w-xs sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
            <Input 
              placeholder="Search patients, records..." 
              className="pl-10 pr-20 sm:pr-32 bg-white/95 border-gray-200 text-sm"
              onClick={() => setOpen(true)}
              readOnly
            />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setOpen(true)}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors h-7 sm:h-8 px-2 sm:px-3"
            >
              <Command className="h-3 w-3 mr-1 hidden sm:block" />
              <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-white/20 px-1 font-mono text-[10px] font-medium text-gray-600">
                <span className="hidden sm:inline">⌘</span>K
              </kbd>
            </Button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* New Patient Button - Hidden on mobile */}
        <Button variant="outline" size="sm" className="hidden sm:flex bg-white/10 border-white/30 text-white hover:bg-white/20">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">New Patient</span>
          <span className="md:hidden">New</span>
        </Button>
        
        {/* Mobile New Patient Button */}
        <Button variant="outline" size="sm" className="sm:hidden bg-white/10 border-white/30 text-white hover:bg-white/20">
          <Plus className="w-4 h-4" />
        </Button>
        
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onDismiss={dismiss}
          onMarkAllAsRead={markAllAsRead}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-1 sm:p-2 text-white hover:bg-white/10">
              <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-xs bg-white/20 text-white">{userInfo.initials}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden lg:block">
                <p className="text-sm font-medium truncate max-w-32 text-white">{userInfo.displayName}</p>
                <p className="text-xs text-white/70 truncate max-w-32">{userInfo.specialty}</p>
              </div>
              <ChevronDown className="w-4 h-4 hidden sm:block text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="floating-panel border-0 mt-2 w-56" align="end">
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              <div className="truncate">{user?.email}</div>
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