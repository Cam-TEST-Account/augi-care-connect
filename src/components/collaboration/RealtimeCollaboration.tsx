import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  MessageSquare, 
  Edit3, 
  Save, 
  Eye, 
  Clock,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PresenceUser {
  user_id: string;
  display_name: string;
  role: string;
  specialty?: string;
  last_seen: string;
  status: 'online' | 'editing' | 'viewing' | 'away';
  current_section?: string;
}

interface CollaborativeNote {
  id: string;
  patient_id: string;
  title: string;
  content: string;
  note_type: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_signed: boolean;
  shared_with_augi_pass: boolean;
  active_editors: string[];
  version: number;
}

interface RealtimeUpdate {
  id: string;
  type: 'note_update' | 'presence_change' | 'comment' | 'audit_event';
  user_id: string;
  patient_id: string;
  data: any;
  timestamp: string;
}

export function RealtimeCollaboration({ patientId }: { patientId: string }) {
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [notes, setNotes] = useState<CollaborativeNote[]>([]);
  const [activeNote, setActiveNote] = useState<CollaborativeNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealtimeUpdate[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user || !patientId) return;

    initializeRealtime();
    fetchNotes();
    trackPresence();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, patientId]);

  const initializeRealtime = () => {
    channelRef.current = supabase
      .channel(`patient_collaboration_${patientId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channelRef.current.presenceState();
        const users = Object.values(presenceState).flat() as PresenceUser[];
        setPresenceUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }: { newPresences: PresenceUser[] }) => {
        const joinedUser = newPresences[0];
        toast({
          title: "Provider Joined",
          description: `${joinedUser.display_name} is now viewing this patient`,
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: { leftPresences: PresenceUser[] }) => {
        const leftUser = leftPresences[0];
        toast({
          title: "Provider Left",
          description: `${leftUser.display_name} stopped viewing this patient`,
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'clinical_notes',
        filter: `patient_id=eq.${patientId}`
      }, (payload) => {
        handleNoteUpdate(payload);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'clinical_notes',
        filter: `patient_id=eq.${patientId}`
      }, (payload) => {
        const newNote = payload.new as CollaborativeNote;
        setNotes(prev => [newNote, ...prev]);
        createAugiPassUpdate('note_created', newNote);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await trackPresence();
        }
      });
  };

  const trackPresence = async () => {
    if (!channelRef.current || !user) return;

    const { data: profile } = await supabase
      .from('provider_profiles')
      .select('first_name, last_name, specialty')
      .eq('user_id', user.id)
      .single();

    const presenceData: PresenceUser = {
      user_id: user.id,
      display_name: profile ? `${profile.first_name} ${profile.last_name}` : user.email?.split('@')[0] || 'Provider',
      role: 'physician',
      specialty: profile?.specialty,
      last_seen: new Date().toISOString(),
      status: 'viewing',
      current_section: 'clinical_notes'
    };

    await channelRef.current.track(presenceData);
  };

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('clinical_notes')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedNotes: CollaborativeNote[] = (data || []).map(note => ({
        ...note,
        created_by: note.provider_id || 'unknown',
        shared_with_augi_pass: false, // Default value
        active_editors: [], // Default empty array
        version: 1 // Default version
      }));
      
      setNotes(transformedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleNoteUpdate = (payload: any) => {
    const updatedNote = payload.new as CollaborativeNote;
    
    setNotes(prev => 
      prev.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      )
    );

    if (activeNote?.id === updatedNote.id) {
      setActiveNote(updatedNote);
      setEditContent(updatedNote.content);
    }

    // Track realtime update
    const update: RealtimeUpdate = {
      id: `${Date.now()}_${Math.random()}`,
      type: 'note_update',
      user_id: payload.new.updated_by || 'system',
      patient_id: patientId,
      data: { note_id: updatedNote.id, changes: payload.new },
      timestamp: new Date().toISOString()
    };

    setRealtimeUpdates(prev => [update, ...prev.slice(0, 19)]); // Keep last 20 updates

    // Share with AugiPass if enabled
    if (updatedNote.shared_with_augi_pass) {
      createAugiPassUpdate('note_updated', updatedNote);
    }
  };

  const createAugiPassUpdate = async (action: string, noteData: CollaborativeNote) => {
    try {
      // This would be sent to AugiPass API for patient visibility
      const augiPassPayload = {
        patient_id: patientId,
        provider_id: user?.id,
        action,
        note_data: {
          id: noteData.id,
          title: noteData.title,
          content: noteData.content,
          note_type: noteData.note_type,
          created_at: noteData.created_at,
          updated_at: noteData.updated_at,
          is_signed: noteData.is_signed
        },
        timestamp: new Date().toISOString(),
        metadata: {
          system: 'augicare_provider',
          version: noteData.version
        }
      };

      // This would call the AugiPass API webhook
      console.log('AugiPass Update:', augiPassPayload);
      
      toast({
        title: "Shared with Patient",
        description: "Note has been synchronized with AugiPass for patient access",
      });
    } catch (error) {
      console.error('Error sharing with AugiPass:', error);
    }
  };

  const startEditing = async (note: CollaborativeNote) => {
    setActiveNote(note);
    setEditContent(note.content);
    setIsEditing(true);

    // Update presence to show editing status
    if (channelRef.current) {
      await channelRef.current.track({
        user_id: user?.id,
        display_name: presenceUsers.find(u => u.user_id === user?.id)?.display_name || 'Provider',
        role: 'physician',
        last_seen: new Date().toISOString(),
        status: 'editing',
        current_section: `note_${note.id}`
      });
    }
  };

  const saveNote = async () => {
    if (!activeNote || !user) return;

    try {
      const { error } = await supabase
        .from('clinical_notes')
        .update({
          content: editContent,
          updated_at: new Date().toISOString(),
          version: activeNote.version + 1
        })
        .eq('id', activeNote.id);

      if (error) throw error;

      setIsEditing(false);
      setActiveNote(null);
      
      // Reset presence status
      await trackPresence();

      toast({
        title: "Note Saved",
        description: "Changes have been saved and shared with the care team",
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !activeNote) return;

    const comment = {
      id: `comment_${Date.now()}`,
      note_id: activeNote.id,
      user_id: user?.id,
      content: newComment,
      created_at: new Date().toISOString()
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');

    toast({
      title: "Comment Added",
      description: "Your comment has been shared with the care team",
    });
  };

  const getPresenceIcon = (status: string) => {
    switch (status) {
      case 'editing': return <Edit3 className="h-3 w-3 text-blue-500" />;
      case 'viewing': return <Eye className="h-3 w-3 text-green-500" />;
      case 'online': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      default: return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Real-time Presence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Care Team Activity ({presenceUsers.length} active)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {presenceUsers.map((user) => (
              <div key={user.user_id} className="flex items-center space-x-2 bg-muted/50 rounded-lg p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.display_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-1">
                  {getPresenceIcon(user.status)}
                  <span className="text-sm font-medium">{user.display_name}</span>
                  {user.specialty && (
                    <Badge variant="outline" className="text-xs">{user.specialty}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Clinical Notes
                </span>
                <Button size="sm">Add Note</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {notes.map((note) => (
                    <Card key={note.id} className={`cursor-pointer transition-colors ${
                      activeNote?.id === note.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{note.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatTimestamp(note.updated_at)} • v{note.version}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {note.shared_with_augi_pass && (
                              <Badge variant="outline" className="text-xs">
                                Shared with Patient
                              </Badge>
                            )}
                            {note.is_signed && (
                              <Badge variant="default" className="text-xs">
                                Signed
                              </Badge>
                            )}
                            {note.active_editors && note.active_editors.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {note.active_editors.length} editing
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {note.content}
                        </p>
                        <div className="flex justify-end space-x-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveNote(note)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => startEditing(note)}
                            disabled={note.active_editors && note.active_editors.some(id => id !== user?.id)}
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Activity & Comments */}
        <div className="space-y-4">
          {/* Editor */}
          {isEditing && activeNote && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Editing: {activeNote.title}</span>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Enter note content..."
                  className="min-h-32"
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={saveNote}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline">
                    Share with Patient
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Real-time Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {realtimeUpdates.slice(0, 10).map((update) => (
                    <div key={update.id} className="text-xs bg-muted/50 rounded p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {update.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-muted-foreground">
                          {formatTimestamp(update.timestamp)}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        Note updated by care team member
                      </p>
                    </div>
                  ))}
                  {realtimeUpdates.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Team Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="text-sm bg-muted/50 rounded p-2">
                      <p className="font-medium">{comment.user_id}</p>
                      <p>{comment.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(comment.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                />
                <Button size="sm" onClick={addComment}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}