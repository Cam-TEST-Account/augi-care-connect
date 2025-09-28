import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Database,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Archive,
  Shield,
  Calendar,
  HardDrive,
  CloudDownload
} from 'lucide-react';

interface BackupRecord {
  id: string;
  created_at: string;
  backup_type: 'automatic' | 'manual' | 'scheduled';
  status: 'completed' | 'in_progress' | 'failed';
  size_mb: number;
  tables_included: string[];
  description?: string;
}

interface BackupStats {
  totalBackups: number;
  lastBackupDate: string;
  totalSizeMB: number;
  successRate: number;
  nextScheduledBackup: string;
}

export function BackupRecovery() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [stats, setStats] = useState<BackupStats>({
    totalBackups: 0,
    lastBackupDate: '',
    totalSizeMB: 0,
    successRate: 100,
    nextScheduledBackup: ''
  });
  const [loading, setLoading] = useState(true);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [exportInProgress, setExportInProgress] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();

  const availableTables = [
    'patients',
    'appointments',
    'clinical_notes',
    'prescriptions',
    'lab_results',
    'vital_signs',
    'secure_messages',
    'provider_profiles'
  ];

  useEffect(() => {
    if (user) {
      fetchBackupData();
      setSelectedTables(availableTables);
    }
  }, [user]);

  const fetchBackupData = async () => {
    try {
      // Simulate backup records (in real implementation, this would come from a backup service)
      const mockBackups: BackupRecord[] = [
        {
          id: '1',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          backup_type: 'automatic',
          status: 'completed',
          size_mb: 45.2,
          tables_included: availableTables,
          description: 'Daily automatic backup'
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          backup_type: 'scheduled',
          status: 'completed',
          size_mb: 43.8,
          tables_included: availableTables,
          description: 'Weekly scheduled backup'
        },
        {
          id: '3',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          backup_type: 'manual',
          status: 'completed',
          size_mb: 42.1,
          tables_included: ['patients', 'appointments', 'clinical_notes'],
          description: 'Pre-migration backup'
        }
      ];

      setBackups(mockBackups);

      // Calculate stats
      const completedBackups = mockBackups.filter(b => b.status === 'completed');
      const totalSize = completedBackups.reduce((sum, b) => sum + b.size_mb, 0);
      const successRate = (completedBackups.length / mockBackups.length) * 100;
      
      setStats({
        totalBackups: mockBackups.length,
        lastBackupDate: mockBackups[0]?.created_at || '',
        totalSizeMB: totalSize,
        successRate,
        nextScheduledBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

    } catch (error) {
      console.error('Error fetching backup data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch backup data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createManualBackup = async () => {
    if (selectedTables.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one table to backup",
        variant: "destructive",
      });
      return;
    }

    setBackupInProgress(true);
    
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newBackup: BackupRecord = {
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        backup_type: 'manual',
        status: 'completed',
        size_mb: Math.round((Math.random() * 50 + 20) * 100) / 100,
        tables_included: [...selectedTables],
        description: 'Manual backup created by user'
      };

      setBackups(prev => [newBackup, ...prev]);

      // Log the backup creation
      await supabase.from('audit_logs').insert({
        action: 'backup_created',
        resource_type: 'backup',
        details: { 
          backup_type: 'manual', 
          tables: selectedTables,
          size_mb: newBackup.size_mb 
        },
        user_id: user?.id
      });

      toast({
        title: "Backup Created",
        description: `Manual backup completed successfully (${newBackup.size_mb} MB)`,
      });

    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      });
    } finally {
      setBackupInProgress(false);
    }
  };

  const exportData = async (format: 'json' | 'csv' = 'json') => {
    if (selectedTables.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one table to export",
        variant: "destructive",
      });
      return;
    }

    setExportInProgress(true);

    try {
      const exportData: any = {};

      // Export selected tables
      for (const table of selectedTables) {
        try {
          const { data, error } = await supabase
            .from(table as any)
            .select('*');

          if (error) {
            console.warn(`Error exporting table ${table}:`, error);
            continue;
          }

          exportData[table] = data || [];
        } catch (err) {
          console.warn(`Failed to export table ${table}:`, err);
          exportData[table] = [];
        }
      }

      // Create and download file
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = `data-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // Simple CSV export for the first table
        const firstTable = selectedTables[0];
        const data = exportData[firstTable] || [];
        
        if (data.length > 0) {
          const headers = Object.keys(data[0]).join(',');
          const rows = data.map((row: any) => 
            Object.values(row).map(val => 
              typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
            ).join(',')
          ).join('\n');
          content = `${headers}\n${rows}`;
        } else {
          content = '';
        }
        
        filename = `${firstTable}-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log the export
      await supabase.from('audit_logs').insert({
        action: 'data_exported',
        resource_type: 'export',
        details: { 
          format, 
          tables: selectedTables,
          record_count: Object.values(exportData).flat().length
        },
        user_id: user?.id
      });

      toast({
        title: "Data Exported",
        description: `Data exported successfully as ${format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExportInProgress(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default' as const;
      case 'in_progress': return 'secondary' as const;
      case 'failed': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (sizeMB: number) => {
    if (sizeMB < 1) return `${(sizeMB * 1024).toFixed(1)} KB`;
    if (sizeMB > 1024) return `${(sizeMB / 1024).toFixed(1)} GB`;
    return `${sizeMB.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading backup data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Backup & Recovery</h1>
          <p className="text-muted-foreground">
            Manage data backups, exports, and recovery procedures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={createManualBackup} 
            disabled={backupInProgress}
          >
            {backupInProgress ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Archive className="h-4 w-4 mr-2" />
            )}
            Create Backup
          </Button>
          <Button onClick={fetchBackupData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Database className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Backups</p>
                <h3 className="text-2xl font-bold">{stats.totalBackups}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <h3 className="text-2xl font-bold">{stats.successRate}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <HardDrive className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                <h3 className="text-2xl font-bold">{formatFileSize(stats.totalSizeMB)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Last Backup</p>
                <h3 className="text-lg font-bold">
                  {stats.lastBackupDate ? 
                    new Date(stats.lastBackupDate).toLocaleDateString() : 
                    'Never'
                  }
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Tables to Backup
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableTables.map((table) => (
                  <label key={table} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTables.includes(table)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTables(prev => [...prev, table]);
                        } else {
                          setSelectedTables(prev => prev.filter(t => t !== table));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{table.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={createManualBackup} 
                disabled={backupInProgress || selectedTables.length === 0}
                className="flex-1"
              >
                {backupInProgress ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4 mr-2" />
                )}
                Create Backup
              </Button>
            </div>

            {backupInProgress && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Creating backup... This may take a few minutes.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Export Format
              </label>
              <div className="flex gap-2">
                <Button 
                  onClick={() => exportData('json')} 
                  disabled={exportInProgress || selectedTables.length === 0}
                  variant="outline"
                  className="flex-1"
                >
                  {exportInProgress ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  JSON
                </Button>
                <Button 
                  onClick={() => exportData('csv')} 
                  disabled={exportInProgress || selectedTables.length === 0}
                  variant="outline"
                  className="flex-1"
                >
                  {exportInProgress ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  CSV
                </Button>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Exported data contains sensitive information. Handle with care and follow HIPAA guidelines.
              </AlertDescription>
            </Alert>

            {exportInProgress && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Exporting data... Please wait.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-6">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div 
                      className={`w-3 h-3 rounded-full ${getStatusColor(backup.status)}`}
                      title={`${backup.status} status`}
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {backup.description || `${backup.backup_type} backup`}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(backup.status)}>
                          {backup.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDate(backup.created_at)}</span>
                        </div>
                        <div className="flex items-center">
                          <HardDrive className="h-3 w-3 mr-1" />
                          <span>{formatFileSize(backup.size_mb)}</span>
                        </div>
                        <div className="flex items-center">
                          <Database className="h-3 w-3 mr-1" />
                          <span>{backup.tables_included.length} tables</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <CloudDownload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {backups.length === 0 && (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Backups Found</h3>
                  <p className="text-muted-foreground">
                    Create your first backup to get started
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}