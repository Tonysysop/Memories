import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NativeTabs } from "@/components/NativeTab";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  X,
  TrendingUp,
  Activity,
  PieChart,
  Plus,
  Banknote,
  Gift,
  Mail
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { EVENT_TYPE_LABELS } from "@/types/event";
import type { EventUpload } from "@/types/event";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Lightbox } from "@/components/Lightbox";
import { AnimatePresence, motion } from "framer-motion";
import { WizardForm } from "@/components/WizardForm";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);



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

   const [isLoadingMore, setIsLoadingMore] = useState(false);
   const [hasMore, setHasMore] = useState(true);
   const [page, setPage] = useState(0);
   const ITEMS_PER_PAGE = 12;

   const fetchUploads = async (eventId: string, pageNum: number = 0) => {
      try {
          if (pageNum === 0) setEvent(prev => prev ? { ...prev, uploads: [] } : null);
          setIsLoadingMore(true);

          const start = pageNum * ITEMS_PER_PAGE;
          const end = start + ITEMS_PER_PAGE - 1;

          // Fetch Media
          const { data: mediaData, error: mediaError } = await supabase
              .from('media')
              .select('*')
              .eq('event_id', eventId)
              .order('created_at', { ascending: false })
              .range(start, end);
          
          if (mediaError) throw mediaError;

          // Fetch Messages
          const { data: messageData, error: msgError } = await supabase
              .from('messages')
              .select('*')
              .eq('event_id', eventId)
              .order('created_at', { ascending: false })
              .range(start, end);

          if (msgError) throw msgError;

          const newUploads: EventUpload[] = [];

          if (mediaData) {
              newUploads.push(...mediaData.map(m => ({
                  id: m.id,
                  type: m.file_type as 'photo' | 'video' | 'gift',
                  content: m.file_url,
                  guestName: m.uploaded_by,
                  createdAt: m.created_at,
                  isApproved: m.is_approved,
                  giftAmount: m.gift_amount,
                  giftMessage: m.gift_message,
                  isAnonymous: m.is_anonymous
              })));
          }

          if (messageData) {
              newUploads.push(...messageData.map(m => ({
                  id: m.id,
                  type: 'message' as const,
                  content: m.message,
                  guestName: m.name,
                  createdAt: m.created_at,
                  isApproved: true
              })));
          }
          
          // Sort by newest first
          newUploads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          setEvent(prev => {
            if (!prev) return null;
            const existingIds = new Set(prev.uploads.map(u => u.id));
            const uniqueNewUploads = newUploads.filter(u => !existingIds.has(u.id));
            return { ...prev, uploads: [...prev.uploads, ...uniqueNewUploads] };
          });

          setHasMore(newUploads.length >= ITEMS_PER_PAGE);
          setIsLoadingMore(false);

      } catch (error) {
          console.error("Error fetching uploads", error);
          setIsLoadingMore(false);
      }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore && event) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUploads(event.id, nextPage);
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

  if (authLoading || !event) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
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

  const handleToggleSetting = async (key: 'isUploadsEnabled' | 'isMessagesEnabled' | 'isGiftingEnabled' | 'isLocked' | 'isLiveFeedEnabled' | 'isGiftTotalHidden', value: boolean) => {
    if (!event) return;
    
    // Optimistic update
    setEvent(prev => prev ? { ...prev, [key]: value } : null);
    
    try {
      await updateEvent(event.id, { [key]: value });
      await refreshEvents();
    } catch {
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
  const gifts = event.uploads.filter(u => u.type === 'gift');
  const totalGiftsAmount = gifts.reduce((acc, curr) => acc + (curr.giftAmount || 0), 0);


  const handleWizardComplete = async (data: any) => {
    try {
      await updateEvent(event.id, {
        name: data.name,
        type: data.type,
        customType: data.customType,
        eventDate: data.eventDate,
        groomFirstName: data.groomFirstName,
        groomLastName: data.groomLastName,
        brideFirstName: data.brideFirstName,
        brideLastName: data.brideLastName,
        religiousRiteVenue: data.religiousRiteVenue,
        religiousRiteStartTime: data.religiousRiteStartTime,
        religiousRiteEndTime: data.religiousRiteEndTime,
        receptionVenue: data.receptionVenue,
        receptionStartTime: data.receptionStartTime,
        receptionEndTime: data.receptionEndTime,
        isLocationPublic: data.isLocationPublic,
        coverImage: data.coverImage,
      });
      
      await refreshEvents();
      const updated = getEventById(event.id);
      if (updated) setEvent(updated);
      setIsEditOpen(false);
      toast({ title: "Event updated!", description: "Changes have been saved successfully." });
    } catch (error) {
      console.error("Error updating event via wizard:", error);
      toast({ title: "Error", description: "Failed to update event.", variant: "destructive" });
    }
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
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setIsEditOpen(true)}>
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
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 font-inter">
                          {photos.map((photo, index) => (
                            <div 
                              key={photo.id} 
                              className="relative break-inside-avoid rounded-xl overflow-hidden bg-muted cursor-zoom-in group mb-4"
                              onClick={() => openLightbox(photos, index)}
                            >
                              <img 
                                src={photo.content} 
                                alt="Guest upload"
                                className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                              
                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                                <div className="flex justify-end">
                                  <Button 
                                    variant="destructive" 
                                    size="icon"
                                    className="h-8 w-8 bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-destructive/80"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteUpload(photo.id);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                {photo.guestName && (
                                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-[10px] text-white/90 font-medium truncate uppercase tracking-wider">
                                      shared by {photo.guestName}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {hasMore && (
                        <div className="mt-12 flex justify-center pb-8 px-4">
                          <Button 
                            variant="outline" 
                            onClick={loadMore} 
                            disabled={isLoadingMore}
                            className="h-12 px-10 rounded-xl font-bold gap-2 border-primary/20 hover:bg-primary/5 active:scale-95 transition-all w-full sm:w-auto overflow-hidden group relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {isLoadingMore ? (
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            ) : (
                              <Plus className="w-5 h-5 text-primary" />
                            )}
                            {isLoadingMore ? "Gathering Memories..." : "Load More Photos"}
                          </Button>
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
                                className="absolute top-2 right-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity h-8 w-8"
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
                      {hasMore && (
                        <div className="mt-12 flex justify-center pb-8 px-4">
                          <Button 
                            variant="outline" 
                            onClick={loadMore} 
                            disabled={isLoadingMore}
                            className="h-12 px-10 rounded-xl font-bold gap-2 border-primary/20 hover:bg-primary/5 active:scale-95 transition-all w-full sm:w-auto overflow-hidden group relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {isLoadingMore ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                            {isLoadingMore ? "Loading..." : "Load More Videos"}
                          </Button>
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
                                className="absolute top-2 right-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteUpload(message.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {hasMore && (
                        <div className="mt-12 flex justify-center pb-8 px-4">
                          <Button 
                            variant="outline" 
                            onClick={loadMore} 
                            disabled={isLoadingMore}
                            className="h-12 px-10 rounded-xl font-bold gap-2 border-primary/20 hover:bg-primary/5 active:scale-95 transition-all w-full sm:w-auto overflow-hidden group relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {isLoadingMore ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                            {isLoadingMore ? "Loading..." : "Load More Messages"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  id: "gifts",
                  label: (
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      <span className="hidden xs:inline">Gifts (₦{totalGiftsAmount.toLocaleString()})</span>
                      <span className="xs:hidden">(₦{totalGiftsAmount.toLocaleString()})</span>
                    </div>
                  ) as any,
                  content: (
                    <div className="mt-2">
                      {gifts.length === 0 ? (
                        <div className="text-center py-12 bg-muted/50 rounded-lg">
                          <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground font-medium">No gifts yet</p>
                          <p className="text-sm text-muted-foreground px-4">Enable gifting in settings to let guests contribute</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                                        <Banknote className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Total Contributions</p>
                                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">₦{totalGiftsAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                          {gifts.map((gift) => (
                            <div key={gift.id} className="group relative bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                    <Banknote className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex flex-col">
                                            <p className="font-semibold text-foreground truncate">{gift.guestName}</p>
                                            {gift.isAnonymous && (
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold bg-muted px-1.5 py-0.5 rounded w-fit mt-0.5">Anonymous</span>
                                            )}
                                        </div>
                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">₦{gift.giftAmount?.toLocaleString()}</span>
                                    </div>
                                    {gift.giftMessage && (
                                        <p className="text-foreground/80 italic text-sm">"{gift.giftMessage}"</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {format(new Date(gift.createdAt), 'MMM d, yyyy h:mm a')}
                                    </p>
                                </div>
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
            <StatsCard photos={photos} videos={videos} messages={messages} total={event.uploads.length} uploads={event.uploads} />
          </div>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none" showCloseButton={false}>
                <WizardForm 
                  isEdit
                  initialData={{
                    ...event,
                    eventDate: event.eventDate
                  }}
                  onComplete={handleWizardComplete}
                  onCancel={() => setIsEditOpen(false)}
                />
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
        event_id={event.id}
        uploads={event.uploads}
      />
    </div>
  );
};

function MobileDrawer({ isOpen, onClose, shareUrl, event, handleCopyLink, handleToggleSetting, photos, videos, messages, uploads }: any) {
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
                <StatsCard photos={photos} videos={videos} messages={messages} total={event.uploads.length} uploads={uploads} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}



const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
        <p className="text-xl font-mono font-bold tracking-[0.1em] text-foreground mt-1">{event.shareCode}</p>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs truncate border border-border font-medium text-muted-foreground">
          {shareUrl}
        </div>
        <Button variant="secondary" size="icon" onClick={handleCopyLink} className="shrink-0 h-9 w-9">
          <Copy className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
        <Button 
            variant="outline" 
            className="w-full gap-2 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-600 text-emerald-600 dark:text-emerald-500"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this event: ${shareUrl}`)}`, '_blank')}
        >
            <WhatsAppIcon className="w-4 h-4" />
            WhatsApp
        </Button>
        <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => window.location.href = `mailto:?subject=${encodeURIComponent(`You're invited: ${event.name}`)}&body=${encodeURIComponent(`Check out this event: ${shareUrl}`)}`}
        >
            <Mail className="w-4 h-4" />
            Email
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
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="gifting" className="text-sm font-medium flex items-center gap-2">
                <Gift className="w-3.5 h-3.5" />
                Cash Gifting
            </Label>
            <p className="text-[11px] text-muted-foreground">Allow guests to send cash gifts</p>
          </div>
          <Switch 
            id="gifting"
            checked={!!event.isGiftingEnabled}
            onCheckedChange={(v) => handleToggleSetting('isGiftingEnabled', v)}
            disabled={event.isLocked}
          />
        </div>
        
        {event.isGiftingEnabled && (
            <div className="flex items-center justify-between pl-6 border-l-2 border-border ml-1.5">
              <div className="space-y-0.5">
                <Label htmlFor="hide-total" className="text-sm font-medium text-muted-foreground">Hide Total Raised</Label>
                <p className="text-[10px] text-muted-foreground/80">Hide total amount from public page</p>
              </div>
              <Switch 
                id="hide-total"
                checked={!!event.isGiftTotalHidden}
                onCheckedChange={(v) => handleToggleSetting('isGiftTotalHidden', v)}
                disabled={event.isLocked}
              />
            </div>
        )}
      </div>
    </div>
  );
}

function ProgressRing({ value, size = 120, strokeWidth = 12, label, sublabel }: { value: number, size?: number, strokeWidth?: number, label: string, sublabel: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-lg">
        {/* Background Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        {/* Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          className="text-primary"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
        <span className="text-2xl font-black text-foreground leading-none">{label}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{sublabel}</span>
      </div>
    </div>
  );
}

function ActivityChart({ data }: { data: number[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  
  return (
    <div className="flex items-end justify-between h-20 gap-1 w-full bg-muted/20 rounded-xl p-4 border border-border/50">
      {data.map((val, i) => {
        // Actually, let's keep 0 as 0 height but maybe show a base line?
        // Let's rely on the bg-muted/20 of the container for "empty" space, but maybe give empty bars a small height?
        // User complained "blank". If everything is 0, it's blank. But we know there is data.
        
        return (
          <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end relative">
             <div 
                className={`w-full rounded-t-sm transition-all duration-500 ${
                  val > 0 ? "bg-primary hover:bg-primary/80" : "bg-muted/20 hover:bg-muted/40"
                }`}
                style={{ height: `${val > 0 ? (val/max)*100 : 5}%` }} 
             />
            {val > 0 && (
              <div className="absolute opacity-0 group-hover:opacity-100 -top-8 bg-foreground text-background text-[10px] px-2 py-1 rounded font-bold pointer-events-none transition-opacity whitespace-nowrap z-50">
                {val} items
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatsCard({ photos, videos, messages, total, uploads }: { photos: any[], videos: any[], messages: any[], total: number, uploads: any[] }) {
  const photoRatio = total > 0 ? (photos.length / (photos.length + videos.length || 1)) * 100 : 0;
  
  // Group activities by hour for the last 24 hours
  const now = new Date();
  const timelineData = Array.from({ length: 24 }).map((_, i) => {
    // Correctly map buckets:
    // i=23 (last bar): [now - 1h, now)
    // i=0 (first bar): [now - 24h, now - 23h)
    const hourStart = new Date(now.getTime() - (24 - i) * 60 * 60 * 1000);
    const hourEnd = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    
    return uploads.filter(u => {
      const date = new Date(u.createdAt);
      return date >= hourStart && date < hourEnd;
    }).length;
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <PieChart className="w-4 h-4" />
          Event Insights
        </h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{total} Total Items</Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
        <div className="flex-shrink-0">
          <ProgressRing 
            value={photoRatio} 
            label={`${photos.length}`} 
            sublabel="Photos" 
          />
        </div>
        <div className="flex-1 space-y-4 w-full">
           <div className="space-y-2">
             <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                <span>Content Split</span>
                <span className="text-foreground">{Math.round(photoRatio)}% Photo</span>
             </div>
             <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                <div style={{ width: `${photoRatio}%` }} className="h-full bg-primary" />
                <div style={{ width: `${100 - photoRatio}%` }} className="h-full bg-indigo-500" />
             </div>
           </div>
           
           <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-[8px] text-muted-foreground uppercase font-black mb-1">Photos</p>
                <p className="font-bold text-sm">{photos.length}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-[8px] text-muted-foreground uppercase font-black mb-1">Videos</p>
                <p className="font-bold text-sm">{videos.length}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 text-center">
                <p className="text-[8px] text-muted-foreground uppercase font-black mb-1">Notes</p>
                <p className="font-bold text-sm">{messages.length}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 text-center col-span-3 mt-1">
                 <div className="flex items-center justify-center gap-1.5 mb-1 text-muted-foreground">
                    <Gift className="w-3 h-3" />
                    <p className="text-[8px] uppercase font-black">Gifts Received</p>
                 </div>
                 <p className="font-bold text-sm">{uploads.filter(u => u.type === 'gift').length}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Live Activity Trends
          </h4>
          <span className="text-[10px] text-muted-foreground font-medium">Last 24h</span>
        </div>
        <ActivityChart data={timelineData} />
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-medium">
          <TrendingUp className="w-3 h-3 text-primary" />
          <span>Real-time engagement tracking active.</span>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;