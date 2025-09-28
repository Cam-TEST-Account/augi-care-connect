import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Search, 
  Plus,
  ChevronDown
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

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userInitials = user?.user_metadata?.first_name && user?.user_metadata?.last_name 
    ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`
    : user?.email?.[0].toUpperCase() || 'DR';

  const userName = user?.user_metadata?.first_name && user?.user_metadata?.last_name
    ? `Dr. ${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    : user?.email || 'Provider';

  const userRole = user?.user_metadata?.specialty || 'Healthcare Provider';

  return (
    <header className="h-16 border-b border-border bg-card shadow-soft px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search patients, records, providers..." 
            className="pl-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Patient
        </Button>
        
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
            3
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
    </header>
  );
};