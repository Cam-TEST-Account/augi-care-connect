import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Notification } from '@/components/notifications/NotificationCenter';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  // Mock notifications for demo - replace with real data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'critical',
      title: 'Critical Lab Value Alert',
      message: 'Patient Sarah Johnson has critically high glucose levels (450 mg/dL). Immediate attention required.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      actions: [
        { label: 'View Patient', onClick: () => console.log('View patient') },
        { label: 'Call Patient', onClick: () => console.log('Call patient') },
      ],
    },
    {
      id: '2',
      type: 'warning',
      title: 'Medication Interaction Warning',
      message: 'Potential interaction detected between Warfarin and new Aspirin prescription for John Doe.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      actions: [
        { label: 'Review Meds', onClick: () => console.log('Review medications') },
      ],
    },
    {
      id: '3',
      type: 'info',
      title: 'Patient Risk Score Change',
      message: 'Maria Garcia\'s risk score increased from Low to Medium based on new wearable data.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      actions: [
        { label: 'View Trends', onClick: () => console.log('View trends') },
      ],
    },
    {
      id: '4',
      type: 'success',
      title: 'Appointment Confirmed',
      message: 'Michael Chen confirmed his appointment for tomorrow at 2:00 PM.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
    },
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  // Real-time subscription for critical alerts
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lab_results',
        },
        (payload) => {
          // Check for critical values
          const labResult = payload.new as any;
          if (labResult.abnormal_flag) {
            const notification: Notification = {
              id: `lab-${labResult.id}`,
              type: 'critical',
              title: 'Critical Lab Value Alert',
              message: `${labResult.test_name}: ${labResult.result_value} ${labResult.unit}`,
              timestamp: new Date(),
              read: false,
            };
            
            setNotifications(prev => [notification, ...prev]);
            
            toast({
              title: 'Critical Lab Alert',
              description: notification.message,
              variant: 'destructive',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast for critical notifications
    if (notification.type === 'critical') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    notifications,
    markAsRead,
    dismiss,
    markAllAsRead,
    addNotification,
  };
};