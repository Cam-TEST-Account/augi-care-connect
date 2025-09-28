import React from 'react';
import { Button } from '@/components/ui/button';
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
  Video
} from 'lucide-react';
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

export const Sidebar: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="w-64 bg-card shadow-medium border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src={augiLogo} alt="Augi Logo" className="w-8 h-8 rounded-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">AugiCare</h1>
            <p className="text-xs text-muted-foreground">Provider Dashboard</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <Button
            key={item.name}
            variant={location.pathname === item.href ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link to={item.href}>
              <item.icon className="w-4 h-4 mr-3" />
              {item.name}
            </Link>
          </Button>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border space-y-2">
        {bottomNavigation.map((item) => (
          <Button
            key={item.name}
            variant={location.pathname === item.href ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link to={item.href}>
              <item.icon className="w-4 h-4 mr-3" />
              {item.name}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};