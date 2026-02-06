import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NativeTabs } from "@/components/NativeTab";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Copy, 
  Image as ImageIcon, 
  MessageSquare, 
  Video,
  Trash2,
  Lock,
  Unlock,
  Share2,
  Camera,
  Loader2,
  Menu,
  X
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { EVENT_TYPE_LABELS } from "@/types/event";
import type { EventType, EventUpload } from "@/types/event";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Lightbox } from "@/components/Lightbox";
import { AnimatePresence, motion } from "framer-motion";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { getEventById, updateEvent, deleteUpload, refreshEvents, events } = useEvents();
  const { toast } = useToast();
  
  // All hooks must be at the top
  const [event, setEvent] = useState(id ? getEventById(id) : null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    date: '',
    type: 'wedding' as EventType,
    customType: ''
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (event) {
      setEditForm({
        name: event.name,
        date: event.eventDate || '',
        type: event.type,
        customType: event.customType || ''
      });
    }
  }, [event?.id]); // Update form when event record changes

  // Lightbox state
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    currentIndex: 0,
    items: [] as EventUpload[]
  });

  const openLightbox = (items: EventUpload[], index: number) => {
    setLightbox({
      isOpen: true,
      currentIndex: index,
      items
    });
  };


  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

   const fetchUploads = async (eventId: string) => {
      try {
          // Fetch Media
          const { data: mediaData } = await supabase
              .from('media')
              .select('*')
              .eq('event_id', eventId);
          
          // Fetch Messages
          const { data: messageData } = await supabase
              .from('messages')
              .select('*')
              .eq('event_id', eventId);

          const uploads: EventUpload[] = [];

          if (mediaData) {
              uploads.push(...mediaData.map(m => ({
                  id: m.id,
                  type: m.file_type as 'photo' | 'video',
                  content: m.file_url,
                  guestName: m.uploaded_by,
                  createdAt: m.created_at,
                  isApproved: m.is_approved
              })));
          }

          if (messageData) {
              uploads.push(...messageData.map(m => ({
                  id: m.id,
                  type: 'message' as const,
                  content: m.message,
                  guestName: m.name,
                  createdAt: m.created_at,
                  isApproved: true
              })));
          }
          
          // Sort by newest first
          uploads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          setEvent(prev => prev ? { ...prev, uploads } : null);

      } catch (error) {
          console.error("Error fetching uploads", error);
      }
  };

  useEffect(() => {
    if (id) {
      const initialEvent = getEventById(id);
      if (initialEvent) {
          setEvent(initialEvent);
          fetchUploads(initialEvent.id);
      }
    }
  }, [id, events]); // added events dependencies so it updates when useEvents loads

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Event not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/event/${event.shareCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied!", description: "Share this link with your guests." });
  };

  const handleToggleSetting = async (key: 'isUploadsEnabled' | 'isMessagesEnabled' | 'isLocked' | 'isLiveFeedEnabled', value: boolean) => {
    if (!event) return;
    
    // Optimistic update
    setEvent(prev => prev ? { ...prev, [key]: value } : null);
    
    try {
      await updateEvent(event.id, { [key]: value });
      await refreshEvents();
    } catch (error) {
      // Revert on error
      const originalEvent = getEventById(event.id);
      if (originalEvent) setEvent(originalEvent);
      toast({ title: "Error", description: "Failed to update setting.", variant: "destructive" });
    }
  };

  const handleDeleteUpload = (uploadId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      deleteUpload(uploadId);
      // Optimistically update local state here too since useEvents updates its list but maybe not trigger refetch immediately
       setEvent(prev => prev ? {
           ...prev,
           uploads: prev.uploads.filter(u => u.id !== uploadId)
       } : null);
    }
  };

  const photos = event.uploads.filter(u => u.type === 'photo');
  const videos = event.uploads.filter(u => u.type === 'video');
  const messages = event.uploads.filter(u => u.type === 'message');


  const handleUpdateEvent = async () => {
    await updateEvent(event.id, {
      name: editForm.name,
      eventDate: editForm.date,
      type: editForm.type,
      customType: editForm.customType
    });
    const updated = getEventById(event.id);
    if (updated) setEvent(updated); // Force update local state
    setIsEditOpen(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `events/${event.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('event-media')
        .getPublicUrl(filePath);

      await updateEvent(event.id, { coverImage: publicUrlData.publicUrl });
      
      setEvent(prev => prev ? { ...prev, coverImage: publicUrlData.publicUrl } : null);
      toast({ title: "Cover updated!", description: "Your new cover image looks great." });
    } catch (error) {
      console.error('Error uploading cover:', error);
      toast({ title: "Error", description: "Failed to update cover image.", variant: "destructive" });
    } finally {
      setIsUploadingCover(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="-ml-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold truncate">{event.name}</h1>
                <p className="text-sm text-muted-foreground truncate">
                  {event.type === 'other' && event.customType 
                    ? event.customType 
                    : EVENT_TYPE_LABELS[event.type]}
                  {event.eventDate && ` • ${format(new Date(event.eventDate), 'MMMM d, yyyy')}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:ml-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => {
                  setEditForm({
                      name: event.name,
                      date: event.eventDate || '',
                      type: event.type,
                      customType: event.customType || ''
                  });
                  setIsEditOpen(true);
              }}>
                  Edit Details
              </Button>

              {event.isLocked && (
                <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                  <Lock className="w-3 h-3" />
                  Locked
                </Badge>
              )}

              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden" 
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover Image */}
            <div className="relative group aspect-video rounded-xl overflow-hidden bg-muted">
                {event.coverImage ? (
                  <img 
                    src={event.coverImage} 
                    alt={event.name}
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                  />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                        <ImageIcon className="w-12 h-12" />
                    </div>
                )}
                
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="bg-background text-foreground px-4 py-2 rounded-lg font-medium shadow-lg flex items-center gap-2">
                        {isUploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                        change Cover Photo
                    </div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleCoverUpload}
                        disabled={isUploadingCover}
                    />
                </label>
            </div>

            {/* Content Tabs */}
            <NativeTabs
              className="w-full max-w-none"
              defaultValue="photos"
              items={[
                {
                  id: "photos",
                  label: (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span className="hidden xs:inline">Photos ({photos.length})</span>
                      <span className="xs:hidden">({photos.length})</span>
                    </div>
                  ) as any,
                  content: (
                    <div className="mt-2">
                       {photos.length === 0 ? (
                        <div className="text-center py-12 bg-muted/50 rounded-lg">
                          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground font-medium">No photos yet</p>
                          <p className="text-sm text-muted-foreground px-4">Share the QR code with your guests to start collecting memories</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 font-inter">
                          {photos.map((photo) => (
                            <div 
                              key={photo.id} 
                              className="group relative aspect-square rounded-xl overflow-hidden bg-muted cursor-zoom-in"
                              onClick={() => openLightbox(photos, photos.indexOf(photo))}
                            >
                              <img 
                                src={photo.content} 
                                alt="Guest photo"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button 
                                  variant="secondary" 
                                  size="icon"
                                  className="h-9 w-9 bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white/40"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUpload(photo.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              {photo.guestName && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                  <p className="text-[10px] text-white/90 font-medium truncate">by {photo.guestName}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  id: "videos",
                  label: (
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span className="hidden xs:inline">Videos ({videos.length})</span>
                      <span className="xs:hidden">({videos.length})</span>
                    </div>
                  ) as any,
                  content: (
                    <div className="mt-2">
                      {videos.length === 0 ? (
                        <div className="text-center py-12 bg-muted/50 rounded-lg">
                          <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground font-medium">No videos yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {videos.map((video) => (
                            <div 
                              key={video.id} 
                              className="group relative aspect-video rounded-xl overflow-hidden bg-muted cursor-zoom-in"
                              onClick={() => openLightbox(videos, videos.indexOf(video))}
                            >
                              <video 
                                src={video.content} 
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                  <Video className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <Button 
                                variant="destructive" 
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUpload(video.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  id: "messages",
                  label: (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden xs:inline">Messages ({messages.length})</span>
                      <span className="xs:hidden">({messages.length})</span>
                    </div>
                  ) as any,
                  content: (
                    <div className="mt-2">
                      {messages.length === 0 ? (
                        <div className="text-center py-12 bg-muted/50 rounded-lg">
                          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground font-medium">No messages yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div key={message.id} className="group relative bg-card border border-border rounded-xl p-5 shadow-sm">
                              <p className="text-foreground leading-relaxed italic">"{message.content}"</p>
                              {message.guestName && (
                                <p className="text-sm font-medium text-primary mt-3">— {message.guestName}</p>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteUpload(message.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            <ShareCard shareUrl={shareUrl} event={event} handleCopyLink={handleCopyLink} />
            <SettingsCard event={event} handleToggleSetting={handleToggleSetting} />
            <StatsCard photos={photos} videos={videos} messages={messages} total={event.uploads.length} />
          </div>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Event Details</DialogTitle>
                    <DialogDescription>
                        Update your event information below. Changes will be saved immediately.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Event Name</Label>
                        <Input 
                            value={editForm.name} 
                            onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Event Date</Label>
                        <Input 
                            type="date"
                            value={editForm.date} 
                            onChange={(e) => setEditForm(prev => ({...prev, date: e.target.value}))}
                        />
                    </div>
                    <div className="space-y-2">
                       <Label>Event Type</Label>
                        <Select 
                            value={editForm.type} 
                            onValueChange={(val: any) => setEditForm(prev => ({...prev, type: val}))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {editForm.type === 'other' && (
                        <div className="space-y-2">
                            <Label>Custom Type</Label>
                            <Input 
                                value={editForm.customType} 
                                onChange={(e) => setEditForm(prev => ({...prev, customType: e.target.value}))}
                                placeholder="E.g. Corporate Retreat"
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateEvent}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </main>

      <Lightbox
        isOpen={lightbox.isOpen}
        onClose={() => setLightbox(prev => ({ ...prev, isOpen: false }))}
        items={lightbox.items}
        currentIndex={lightbox.currentIndex}
        onNavigate={(index) => setLightbox(prev => ({ ...prev, currentIndex: index }))}
      />

      <MobileDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        shareUrl={shareUrl}
        event={event}
        handleCopyLink={handleCopyLink}
        handleToggleSetting={handleToggleSetting}
        photos={photos}
        videos={videos}
        messages={messages}
      />
    </div>
  );
};

function MobileDrawer({ isOpen, onClose, shareUrl, event, handleCopyLink, handleToggleSetting, photos, videos, messages }: any) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-background border-l border-border z-[101] shadow-2xl lg:hidden overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-primary">Manage Event</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2">
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <ShareCard shareUrl={shareUrl} event={event} handleCopyLink={handleCopyLink} />
                <SettingsCard event={event} handleToggleSetting={handleToggleSetting} />
                <StatsCard photos={photos} videos={videos} messages={messages} total={event.uploads.length} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}



function ShareCard({ shareUrl, event, handleCopyLink }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-primary">
        <Share2 className="w-4 h-4" />
        Share with Guests
      </h3>
      <div className="bg-white p-4 rounded-xl mb-4 flex items-center justify-center border border-border shadow-inner">
        <QRCodeSVG 
          value={shareUrl} 
          size={180}
          level="M"
          includeMargin={false}
        />
      </div>
      <div className="mb-4">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Event Code</Label>
        <p className="text-3xl font-mono font-bold tracking-[0.1em] text-foreground mt-1">{event.shareCode}</p>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs truncate border border-border font-medium text-muted-foreground">
          {shareUrl}
        </div>
        <Button variant="secondary" size="icon" onClick={handleCopyLink} className="shrink-0 h-9 w-9">
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function SettingsCard({ event, handleToggleSetting }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4 text-primary">Event Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="uploads" className="text-sm font-medium">Photo/Video Uploads</Label>
            <p className="text-[11px] text-muted-foreground">Allow guests to upload media</p>
          </div>
          <Switch 
            id="uploads"
            checked={!!event.isUploadsEnabled}
            onCheckedChange={(v) => handleToggleSetting('isUploadsEnabled', v)}
            disabled={event.isLocked}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="messages" className="text-sm font-medium">Guest Messages</Label>
            <p className="text-[11px] text-muted-foreground">Allow guests to leave messages</p>
          </div>
          <Switch 
            id="messages"
            checked={!!event.isMessagesEnabled}
            onCheckedChange={(v) => handleToggleSetting('isMessagesEnabled', v)}
            disabled={event.isLocked}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="live-feed" className="text-sm font-medium">Live Feed (Guest View)</Label>
            <p className="text-[11px] text-muted-foreground">Allow guests to see other uploads</p>
          </div>
          <Switch 
            id="live-feed"
            checked={!!event.isLiveFeedEnabled}
            onCheckedChange={(v) => handleToggleSetting('isLiveFeedEnabled', v)}
            disabled={event.isLocked}
          />
        </div>
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="lock" className="flex items-center gap-2 text-sm font-medium">
                {event.isLocked ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4" />}
                Lock Event
              </Label>
              <p className="text-[11px] text-muted-foreground">Prevent new uploads</p>
            </div>
            <Switch 
              id="lock"
              checked={!!event.isLocked}
              onCheckedChange={(v) => handleToggleSetting('isLocked', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ photos, videos, messages, total }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4 text-primary">Statistics</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Photos</span>
          <span className="font-bold">{photos.length}</span>
        </div>
        <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Videos</span>
          <span className="font-bold">{videos.length}</span>
        </div>
        <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Messages</span>
          <span className="font-bold">{messages.length}</span>
        </div>
        <div className="border-t border-border pt-4 flex justify-between items-center">
          <span className="text-sm font-bold text-muted-foreground">TOTAL CONTENT</span>
          <span className="font-black text-2xl text-primary">{total}</span>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;