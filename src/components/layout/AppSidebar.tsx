import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Bell,
  LayoutDashboard,
  ExternalLink
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Patients', icon: Users, href: '/patients' },
  { name: 'Notifications', icon: Bell, href: '/messages' },
  { name: 'Appointments', icon: Calendar, href: '/appointments' },
  { name: 'Messages', icon: MessageSquare, href: '/telehealth' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const collapsed = state === "collapsed";

  return (
    <Sidebar 
      className="bg-white border-r border-border"
      collapsible="icon"
    >
      {/* Header with Augi Logo */}
      <SidebarHeader className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif text-augi-forest italic">augi</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          ) : (
            <span className="text-xl font-serif text-augi-forest italic">a</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild
                    className={`transition-all duration-200 rounded-lg ${
                      isActive(item.href) 
                        ? 'bg-augi-sage text-white font-medium' 
                        : 'hover:bg-augi-cream text-foreground'
                    }`}
                    tooltip={collapsed ? item.name : undefined}
                  >
                    <Link to={item.href} className="flex items-center">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <span className="ml-3 truncate">{item.name}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User */}
      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 bg-augi-forest">
            <AvatarFallback className="bg-augi-forest text-white text-sm font-medium">
              ND
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Nishtha D.</p>
              <p className="text-xs text-muted-foreground truncate">Lunar Health</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
