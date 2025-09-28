import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Calendar,
  Users,
  MessageSquare,
  FileText,
  Settings,
  Shield,
  BarChart3,
  Stethoscope,
  Plus,
  Search,
  Phone,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  const commands = [
    {
      group: 'Navigation',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, action: () => navigate('/') },
        { id: 'patients', label: 'Patients', icon: Users, action: () => navigate('/patients') },
        { id: 'appointments', label: 'Appointments', icon: Calendar, action: () => navigate('/appointments') },
        { id: 'messages', label: 'Messages', icon: MessageSquare, action: () => navigate('/messages') },
        { id: 'providers', label: 'Providers', icon: Stethoscope, action: () => navigate('/providers') },
        { id: 'records', label: 'Records', icon: FileText, action: () => navigate('/records') },
        { id: 'telehealth', label: 'Telehealth', icon: Phone, action: () => navigate('/telehealth') },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, action: () => navigate('/analytics') },
        { id: 'security', label: 'Security', icon: Shield, action: () => navigate('/security') },
        { id: 'settings', label: 'Settings', icon: Settings, action: () => navigate('/settings') },
      ],
    },
    {
      group: 'Quick Actions',
      items: [
        { id: 'new-patient', label: 'Add New Patient', icon: Plus, action: () => console.log('Add patient') },
        { id: 'new-appointment', label: 'Schedule Appointment', icon: Calendar, action: () => console.log('Schedule appointment') },
        { id: 'new-message', label: 'Send Message', icon: MessageSquare, action: () => console.log('Send message') },
        { id: 'search-npi', label: 'Search NPI Provider', icon: Search, action: () => navigate('/providers') },
      ],
    },
  ];

  const handleSelect = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commands.map((group) => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.items.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item.action)}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;