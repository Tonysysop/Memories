import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  Camera, 
  MessageSquare, 
  Upload,
  X,
  Lock,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MemoryEvent, EventType } from "@/types/event";
import { EVENT_TYPE_LABELS } from "@/types/event";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

const LiveFeed = ({ eventId }: { eventId: string }) => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchExisting = async () => {
      const { data: media } = await supabase
        .from('media')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(10);

      const combined = [
        ...(media || []).map(m => ({ ...m, type: m.file_type })),
        ...(messages || []).map(m => ({ ...m, type: 'message' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15);

      setItems(combined);
      setIsLoading(false);
    };

    fetchExisting();

    // Realtime subscriptions
    const mediaChannel = supabase
      .channel('media-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'media',
        filter: `event_id=eq.${eventId}` 
      }, (payload) => {
        setItems(prev => [{ ...payload.new, type: payload.new.file_type }, ...prev].slice(0, 15));
      })
      .subscribe();

    const messageChannel = supabase
      .channel('message-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `event_id=eq.${eventId}` 
      }, (payload) => {
        setItems(prev => [{ ...payload.new, type: 'message' }, ...prev].slice(0, 15));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(mediaChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [eventId]);

  if (isLoading) return null;
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden p-4 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {item.uploaded_by?.[0] || item.name?.[0] || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {item.uploaded_by || item.name || 'Anonymous Guest'}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {item.type === 'message' ? (
                <p className="text-sm text-white/80 leading-relaxed italic">
                  "{item.message}"
                </p>
              ) : (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40">
                  {item.type === 'photo' ? (
                    <img 
                      src={item.file_url} 
                      className="w-full h-full object-cover" 
                      alt="Live upload" 
                    />
                  ) : (
                    <video 
                      src={item.file_url} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
  );
};

const FloatingHearts = ({ hearts, onComplete }: { hearts: { id: number, x: number }[], onComplete: (id: number) => void }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ y: "100vh", x: heart.x, opacity: 1, scale: 0.5, rotate: 0 }}
            animate={{ 
              y: "-10vh", 
              x: heart.x + (Math.random() * 100 - 50),
              opacity: 0,
              scale: 1.5,
              rotate: Math.random() * 90 - 45
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 + Math.random() * 2, ease: "easeOut" }}
            onAnimationComplete={() => onComplete(heart.id)}
            className="absolute bottom-0"
          >
            <Heart className="w-8 h-8 text-white fill-current drop-shadow-2xl" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-2 sm:gap-4 mb-2">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Mins", value: timeLeft.minutes },
        { label: "Secs", value: timeLeft.seconds },
      ].map((item) => (
        <div 
          key={item.label}
          className="flex flex-col items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-3 py-3 sm:px-5 sm:py-4 min-w-[65px] sm:min-w-[80px] shadow-2xl"
        >
          <span className="text-xl sm:text-3xl font-bold text-white tabular-nums leading-none mb-1">
            {item.value.toString().padStart(2, '0')}
          </span>
          <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/50 font-semibold">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const RotatingMessages = () => {
  const messages = [
    "Preparing the celebration...",
    "Capture every moment once we begin.",
    "Guideline: Be kind and share your best shots!",
    "Ready your cameras for the big event!",
    "Guideline: High-quality photos are preferred! ✨",
    "Uploads open automatically when time's up.",
    "Share the love through photos and messages."
  ];
  
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="h-12 flex items-center justify-center overflow-hidden w-full px-8">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -10 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="text-white/40 text-sm text-center font-medium italic tracking-wide"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

const GuestUpload = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const { toast } = useToast();
  const [memoryEvent, setMemoryEvent] = useState<MemoryEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [showLiveFeed, setShowLiveFeed] = useState(true);
  const [hearts, setHearts] = useState<{ id: number, x: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fireConfetti = useCallback(() => {
    const duration = 1500;
    const end = Date.now() + duration;
    const colors = ["#ff0040", "#ff6b6b", "#ffd700", "#ff69b4", "#ffffff"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const triggerHearts = useCallback(() => {
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth
    }));
    setHearts(prev => [...prev, ...newHearts]);
  }, []);

  const removeHeart = useCallback((id: number) => {
    setHearts(prev => prev.filter(h => h.id !== id));
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!shareCode) return;
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', shareCode)
        .single();

      if (error || !data) {
        setMemoryEvent(null);
      } else {
        setMemoryEvent({
          id: data.id,
          hostId: data.user_id,
          name: data.title,
          type: data.event_type as any as EventType,
          customType: data.custom_type,
          coverImage: data.cover_image,
          shareCode: data.slug,
          createdAt: data.created_at,
          eventDate: data.event_date,
          isUploadsEnabled: data.is_uploads_enabled,
          isMessagesEnabled: data.is_messages_enabled,
          isLocked: data.is_locked,
          isLiveFeedEnabled: !!data.is_live_feed_enabled,
          uploads: [] 
        });
      }
      setIsLoading(false);
    };

    fetchEvent();
  }, [shareCode]);

  const isEventStarted = !memoryEvent?.eventDate || new Date(memoryEvent.eventDate) <= new Date();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateName = () => {
    if (!guestName.trim()) {
      toast({ title: "Name required", description: "Please enter your name before continuing.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmitMedia = async () => {
    if (selectedFiles.length === 0 || !validateName() || !memoryEvent) return;
    
    setIsSubmitting(true);
    
    try {
      // Re-fetch event status to ensure it's not locked or uploads disabled
      const { data: latestEvent, error: fetchError } = await supabase
        .from('events')
        .select('is_locked, is_uploads_enabled, event_date')
        .eq('id', memoryEvent.id)
        .single();

      if (fetchError || !latestEvent) throw new Error("Could not verify event status");
      
      const eventStarted = !latestEvent.event_date || new Date(latestEvent.event_date) <= new Date();
      if (!eventStarted) {
        toast({ title: "Event Not Started", description: "This event hasn't started yet. Please come back later!", variant: "destructive" });
        return;
      }

      if (latestEvent.is_locked) {
        toast({ title: "Event Locked", description: "This event is no longer accepting submissions.", variant: "destructive" });
        setMemoryEvent(prev => prev ? { ...prev, isLocked: true } : null);
        return;
      }

      if (!latestEvent.is_uploads_enabled) {
        toast({ title: "Uploads Disabled", description: "The host has disabled new photo/video uploads.", variant: "destructive" });
        setMemoryEvent(prev => prev ? { ...prev, isUploadsEnabled: false } : null);
        return;
      }

      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `events/${memoryEvent.id}/${fileName}`;

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('event-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('event-media')
          .getPublicUrl(filePath);

        // 3. Save to Media Table
        const { error: dbError } = await supabase
          .from('media')
          .insert({
            event_id: memoryEvent.id,
            file_type: file.type.startsWith('image/') ? 'photo' : 'video',
            file_url: publicUrl,
            uploaded_by: guestName.trim()
          });

        if (dbError) throw dbError;
      }

      toast({ title: "🎉 Upload complete!", description: `${selectedFiles.length} file(s) uploaded successfully.` });
      setSelectedFiles([]);
      fireConfetti();
      triggerHearts();
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({ title: "Error", description: "Failed to upload files. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMessage = async () => {
    if (!message.trim() || !validateName() || !memoryEvent) return;
    
    setIsSubmitting(true);
    try {
      // Re-fetch event status to ensure it's not locked or messages disabled
      const { data: latestEvent, error: fetchError } = await supabase
        .from('events')
        .select('is_locked, is_messages_enabled, event_date')
        .eq('id', memoryEvent.id)
        .single();

      if (fetchError || !latestEvent) throw new Error("Could not verify event status");

      const eventStarted = !latestEvent.event_date || new Date(latestEvent.event_date) <= new Date();
      if (!eventStarted) {
        toast({ title: "Event Not Started", description: "This event hasn't started yet. Please come back later!", variant: "destructive" });
        return;
      }

      if (latestEvent.is_locked) {
        toast({ title: "Event Locked", description: "This event is no longer accepting submissions.", variant: "destructive" });
        setMemoryEvent(prev => prev ? { ...prev, isLocked: true } : null);
        return;
      }

      if (!latestEvent.is_messages_enabled) {
        toast({ title: "Messages Disabled", description: "The host has disabled new guest messages.", variant: "destructive" });
        setMemoryEvent(prev => prev ? { ...prev, isMessagesEnabled: false } : null);
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          event_id: memoryEvent.id,
          message: message.trim(),
          name: guestName.trim()
        });

      if (error) throw error;

      toast({ title: "💬 Message sent!", description: "Your message has been added." });
      setMessage("");
      setShowCommentBox(false);
      fireConfetti();
      triggerHearts();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    );
  }

  if (!memoryEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center max-w-md">
          <Heart className="w-16 h-16 mx-auto text-white/40 mb-4" />
          <h1 className="text-2xl font-display font-semibold text-white mb-2">Event Not Found</h1>
          <p className="text-white/60">
            This event doesn't exist or the link may be incorrect.
          </p>
        </div>
      </div>
    );
  }

  if (memoryEvent.isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto text-white/40 mb-4" />
          <h1 className="text-2xl font-display font-semibold text-white mb-2">Event Locked</h1>
          <p className="text-white/60">
            This event is no longer accepting new uploads.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col dark bg-black">
      <FloatingHearts hearts={hearts} onComplete={removeHeart} />
      {/* Faded Backdrop */}
      <div className="fixed inset-0 z-0">
        {memoryEvent.coverImage ? (
          <img 
            src={memoryEvent.coverImage} 
            alt="" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/80 via-primary/40 to-black" />
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-4 py-12 pb-24">
        <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">{memoryEvent.name}</h1>
          <p className="text-white/60 text-sm">
            {memoryEvent.type === 'other' && memoryEvent.customType 
              ? memoryEvent.customType 
              : EVENT_TYPE_LABELS[memoryEvent.type]}
          </p>
        </div>

        {/* Countdown Timer */}
        {memoryEvent.eventDate && new Date(memoryEvent.eventDate) > new Date() && (
          <div className="mb-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000 slide-in-from-top-4">
            <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-5 font-bold">Event Countdown</p>
            <CountdownTimer targetDate={memoryEvent.eventDate} />
          </div>
        )}

        {/* Glassmorphism Card */}
        <div className="flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!isEventStarted ? (
            <motion.div 
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm flex flex-col items-center gap-8"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-white/50" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Uploads open automatically when event starts.
                </p>
                <div className="py-3 px-4 bg-white/5 rounded-full border border-white/10 inline-flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-white/80 font-medium tracking-wide">Waiting for host...</span>
                </div>
              </div>
              
              <RotatingMessages />
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 space-y-5"
            >
              {/* Name Input */}
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">Your Name</label>
            <Input
              placeholder="Enter your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30"
            />
          </div>

          {/* Photo Previews */}
          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {selectedFiles.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {memoryEvent.isUploadsEnabled && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
              {selectedFiles.length === 0 ? (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-14 rounded-full text-base gap-3 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <Camera className="w-5 h-5" />
                  Upload Photos
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1 rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
                  >
                    Add More
                  </Button>
                  <Button
                    onClick={handleSubmitMedia}
                    disabled={isSubmitting}
                    className="flex-1 rounded-full gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Upload className="w-4 h-4" />
                    {isSubmitting ? "Uploading..." : `Send ${selectedFiles.length}`}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Comment Section */}
          {memoryEvent.isMessagesEnabled && (
            <>
              {!showCommentBox ? (
                <Button
                  variant="outline"
                  onClick={() => setShowCommentBox(true)}
                  className="w-full rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Leave a Comment
                </Button>
              ) : (
                <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                  <Textarea
                    placeholder="Write a quick comment..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30 resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => { setShowCommentBox(false); setMessage(""); }}
                      className="flex-1 rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitMessage}
                      disabled={!message.trim() || isSubmitting}
                      className="flex-1 rounded-full gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
        </AnimatePresence>
      </div>
      </div>

      {/* Live Feed Section */}
      {memoryEvent.isLiveFeedEnabled && isEventStarted && (
        <div className="mt-16 w-full max-w-lg space-y-6 mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <button 
              onClick={() => setShowLiveFeed(!showLiveFeed)}
              className="text-white/60 text-sm font-medium uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
            >
              <div className={`w-2 h-2 rounded-full bg-red-500 ${showLiveFeed ? 'animate-pulse' : ''}`} />
              Live Feed {showLiveFeed ? '(Hide)' : '(Show)'}
            </button>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          
          {showLiveFeed && <LiveFeed eventId={memoryEvent.id} />}
        </div>
      )}
    </div>
  </div>
);
};

export default GuestUpload;