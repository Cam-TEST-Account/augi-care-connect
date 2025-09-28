import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Search,
  Settings,
  Shield,
  Activity,
  Video,
  ChevronRight
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import augiLogo from '@/assets/augi-logo.png';

const navigation = [
  { name: 'Dashboard', icon: Activity, href: '/' },
  { name: 'Patients', icon: Users, href: '/patients' },
  { name: 'Appointments', icon: Calendar, href: '/appointments' },
  { name: 'Telehealth', icon: Video, href: '/telehealth' },
  { name: 'Messages', icon: MessageSquare, href: '/messages' },
  { name: 'Records', icon: FileText, href: '/records' },
  { name: 'Provider Search', icon: Search, href: '/providers' },
  { name: 'Analytics', icon: Activity, href: '/analytics' },
];

const bottomNavigation = [
  { name: 'Security', icon: Shield, href: '/security' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export function AppSidebar() {
  const { state, open } = useSidebar();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const isExpanded = navigation.some((item) => isActive(item.href));
  const collapsed = state === "collapsed";

  return (
    <Sidebar 
      className="floating-panel border-r-0"
      style={{ background: 'var(--gradient-glass)' }}
      collapsible="icon"
    >
      {/* Header with Logo */}
      <SidebarHeader className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <img src={augiLogo} alt="Augi Logo" className="w-8 h-8 rounded-lg" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-foreground truncate">AugiCare</h1>
              <p className="text-xs text-muted-foreground truncate">Provider Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild
                    className={`transition-all duration-200 ${
                      isActive(item.href) 
                        ? 'bg-primary text-primary-foreground font-medium shadow-button' 
                        : 'hover:bg-muted/50 hover:scale-[1.02]'
                    }`}
                    tooltip={collapsed ? item.name : undefined}
                  >
                    <Link to={item.href} className="flex items-center">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="ml-3 truncate">{item.name}</span>
                          {isActive(item.href) && (
                            <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
                          )}
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild
                    className={`transition-all duration-200 ${
                      isActive(item.href) 
                        ? 'bg-primary text-primary-foreground font-medium shadow-button' 
                        : 'hover:bg-muted/50 hover:scale-[1.02]'
                    }`}
                    tooltip={collapsed ? item.name : undefined}
                  >
                    <Link to={item.href} className="flex items-center">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="ml-3 truncate">{item.name}</span>
                          {isActive(item.href) && (
                            <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
                          )}
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Trigger */}
      <SidebarFooter className="p-2 border-t border-border">
        <SidebarTrigger className="w-full h-8 flex items-center justify-center hover:bg-muted/50 rounded-md transition-colors" />
      </SidebarFooter>
    </Sidebar>
  );
}