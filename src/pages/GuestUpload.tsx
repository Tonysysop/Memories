import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  Camera, 
  MessageSquare, 
  Upload,
  X,
  Lock,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MemoryEvent, EventType } from "@/types/event";
import { EVENT_TYPE_LABELS } from "@/types/event";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/PageTransition";
import { Progress } from "@/components/ui/progress";

const LiveFeed = ({ items, isLoading }: { items: any[], isLoading: boolean }) => {
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
                  {item.is_anonymous && item.type === 'gift' ? '?' : (item.uploaded_by?.[0] || item.name?.[0] || '?')}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {item.is_anonymous && item.type === 'gift' ? 'Anonymous Guest' : (item.uploaded_by || item.name || 'Anonymous Guest')}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {item.type === 'gift' ? (
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-white/90 font-medium">
                    Sent a cash gift
                  </p>
                </div>
              ) : item.type === 'message' ? (
                <p className="text-sm text-white/80 leading-relaxed italic">
                  "{item.message}"
                </p>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-black/40">
                  {item.type === 'photo' ? (
                    <img 
                      src={item.file_url} 
                      className="w-full h-auto block" 
                      alt="Live upload" 
                    />
                  ) : (
                    <video 
                      src={item.file_url} 
                      className="w-full h-auto block" 
                      controls={false}
                      autoPlay
                      muted
                      loop
                      playsInline
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
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const totalProgress = selectedFiles.length > 0 
    ? Math.round(Object.values(uploadProgress).reduce((acc, curr) => acc + curr, 0) / selectedFiles.length)
    : 0;

  const fireConfetti = useCallback((isFinal: boolean = false) => {
    const duration = isFinal ? 3000 : 1500;
    const end = Date.now() + duration;
    const colors = ["#ff0040", "#ff6b6b", "#ffd700", "#ff69b4", "#ffffff"];

    const frame = () => {
      confetti({
        particleCount: isFinal ? 5 : 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: isFinal ? 5 : 3,
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
    const handleScroll = () => {
      if (window.scrollY < 100) setHasNewActivity(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchEventAndFeed = async () => {
      if (!shareCode) return;
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', shareCode)
        .single();

      if (error || !data) {
        setMemoryEvent(null);
        setIsLoading(false);
        return;
      } 
      
      const mappedEvent = {
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
      };
      
      setMemoryEvent(mappedEvent);
      setIsLoading(false);

      // Fetch Feed
      const { data: media } = await supabase
        .from('media')
        .select('*')
        .eq('event_id', data.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('event_id', data.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const combined = [
        ...(media || []).map(m => ({ ...m, type: m.file_type })),
        ...(messages || []).map(m => ({ ...m, type: 'message' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15);

      setFeedItems(combined);
      setIsFeedLoading(false);

      // Realtime subscriptions
      const mediaChannel = supabase
        .channel(`media-${data.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'media',
          filter: `event_id=eq.${data.id}` 
        }, (payload) => {
          setFeedItems(prev => {
            if (prev.some(item => item.id === payload.new.id)) return prev;
            if (window.scrollY > 400) setHasNewActivity(true);
            return [{ ...payload.new, type: payload.new.file_type }, ...prev].slice(0, 15);
          });
        })
        .subscribe();

      const messageChannel = supabase
        .channel(`messages-${data.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `event_id=eq.${data.id}` 
        }, (payload) => {
          setFeedItems(prev => {
            if (prev.some(item => item.id === payload.new.id)) return prev;
            if (window.scrollY > 400) setHasNewActivity(true);
            return [{ ...payload.new, type: 'message' }, ...prev].slice(0, 15);
          });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(mediaChannel);
        supabase.removeChannel(messageChannel);
      };
    };

    fetchEventAndFeed();
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

        const { error: uploadError } = await supabase.storage
          .from('event-media')
          .upload(filePath, file, {
            onUploadProgress: (progress: any) => {
              const percent = (progress.loaded / progress.total) * 100;
              setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
            }
          } as any);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('event-media')
          .getPublicUrl(filePath);

        const { data: mediaEntry, error: dbError } = await supabase
          .from('media')
          .insert({
            event_id: memoryEvent.id,
            file_type: file.type.startsWith('image/') ? 'photo' : 'video',
            file_url: publicUrl,
            uploaded_by: guestName.trim()
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Immediate UI Update
        if (mediaEntry) {
          setFeedItems(prev => {
            if (prev.some(item => item.id === mediaEntry.id)) return prev;
            return [{ ...mediaEntry, type: mediaEntry.file_type }, ...prev].slice(0, 15);
          });
        }
      }

      toast({ title: "🎉 Upload complete!", description: `${selectedFiles.length} file(s) uploaded successfully.` });
      setSelectedFiles([]);
      setUploadProgress({});
      setIsSubmitted(true);
      fireConfetti(true);
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

      const { data: messageEntry, error } = await supabase
        .from('messages')
        .insert({
          event_id: memoryEvent.id,
          message: message.trim(),
          name: guestName.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Immediate UI Update
      if (messageEntry) {
        setFeedItems(prev => {
          if (prev.some(item => item.id === messageEntry.id)) return prev;
          return [{ ...messageEntry, type: 'message' }, ...prev].slice(0, 15);
        });
      }

      toast({ title: "💬 Message sent!", description: "Your message has been added." });
      setMessage("");
      setShowCommentBox(false);
      setIsSubmitted(true);
      fireConfetti(true);
      triggerHearts();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitGift = async () => {
    const finalAmount = giftAmount || (customGiftAmount ? parseFloat(customGiftAmount) : 0);
    if (!finalAmount || finalAmount <= 0) {
      toast({ title: "Invalid Amount", description: "Please select or enter a valid gift amount.", variant: "destructive" });
      return;
    }
    if (!validateName() || !memoryEvent) return;

    setIsSubmitting(true);
    try {
      // Check event status
      const { data: latestEvent, error: fetchError } = await supabase
        .from('events')
        .select('is_locked, is_gifting_enabled')
        .eq('id', memoryEvent.id)
        .single();

      if (fetchError || !latestEvent) throw new Error("Could not verify event status");

      if (latestEvent.is_locked) {
        toast({ title: "Event Locked", description: "This event is no longer accepting submissions.", variant: "destructive" });
        setMemoryEvent(prev => prev ? { ...prev, isLocked: true } : null);
        return;
      }

      if (!latestEvent.is_gifting_enabled) {
        toast({ title: "Gifting Disabled", description: "The host has disabled cash gifting.", variant: "destructive" });
        setMemoryEvent(prev => prev ? { ...prev, isGiftingEnabled: false } : null);
        return;
      }

      // Mock Gift Submission
      const { data: giftEntry, error } = await supabase
        .from('media')
        .insert({
          event_id: memoryEvent.id,
          file_type: 'gift',
          file_url: 'gift-placeholder', // Not used for gifts
          uploaded_by: guestName.trim(),
          gift_amount: finalAmount,
          gift_message: giftMessage.trim(),
          is_anonymous: isAnonymous
        })
        .select()
        .single();
      
      if (error) throw error;

      // Immediate UI Update
      if (giftEntry) {
         setFeedItems(prev => {
            if (prev.some(item => item.id === giftEntry.id)) return prev;
            return [{ ...giftEntry, type: 'gift', giftAmount: finalAmount, giftMessage: giftMessage.trim(), is_anonymous: isAnonymous }, ...prev].slice(0, 15);
         });
      }

      toast({ title: "🎁 Gift Sent!", description: `You sent ₦${finalAmount.toLocaleString()} to the host.` });
      setGiftAmount(null);
      setCustomGiftAmount("");
      setGiftMessage("");
      setIsAnonymous(false);
      setShowGiftPanel(false);
      setSubmissionType('gift');
      setIsSubmitted(true);
      
      // Gold Confetti
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ["#E60023", "#FFD700", "#FFFFFF", "#FFA500"]; // Red (Primary) + Gold theme

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.8 },
          colors,
          zIndex: 9999
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.8 },
          colors,
          zIndex: 9999
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      triggerHearts();

    } catch (error) {
       console.error('Error sending gift:', error);
       toast({ title: "Error", description: "Failed to send gift. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="w-12 h-12 rounded-full mx-auto bg-white/10" />
            <Skeleton className="h-8 w-48 mx-auto bg-white/10" />
            <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 bg-white/10" />
              <Skeleton className="h-12 w-full bg-white/10" />
            </div>
            <Skeleton className="h-14 w-full rounded-full bg-white/10" />
            <Skeleton className="h-10 w-full rounded-full bg-white/10" />
          </div>
        </div>
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
    <PageTransition>
      <div className="min-h-screen relative flex flex-col dark bg-black font-inter">
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
              <h1 className="text-3xl font-display font-bold text-white mb-1 tracking-tight">{memoryEvent.name}</h1>
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
              {isSubmitted ? (
                <motion.div
                  key="thank-you"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: -20 }}
                  className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                  
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <CheckCircle2 className="w-10 h-10 text-primary relative z-10" />
                  </div>
                  
                  <h2 className="text-3xl font-display font-bold text-white mb-4 tracking-tight">Memories Shared!</h2>
                  <p className="text-white/60 text-base leading-relaxed mb-10">
                    Thank you for being part of {memoryEvent.name}. Your contribution has been added to the collection.
                  </p>
                  
                  <div className="space-y-4">
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      className="w-full h-14 rounded-2xl text-base gap-3 bg-white text-black hover:bg-white/90 shadow-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Sparkles className="w-5 h-5 text-primary" />
                      Keep Sharing
                    </Button>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Scroll down to see the feed</p>
                  </div>
                </motion.div>
              ) : !isEventStarted ? (
                <motion.div 
                  key="waiting"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-sm flex flex-col items-center gap-8"
                >
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 w-full text-center shadow-2xl">
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 space-y-6 shadow-2xl"
                >
                  {/* Name Input */}
                  <div>
                    <label className="text-white/80 text-[10px] uppercase tracking-widest font-bold mb-3 block px-1">Guest Identification</label>
                    <Input
                      placeholder="Enter your name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20 h-12 rounded-xl"
                    />
                  </div>

                  {/* Photo Previews */}
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 py-2">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-white/10 group">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          {!isSubmitting ? (
                            <button
                              onClick={() => removeFile(i)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          ) : (
                            <div className="absolute inset-x-1 bottom-1">
                              <Progress value={uploadProgress[file.name] || 0} className="h-1" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {memoryEvent.isUploadsEnabled && (
                    <div className="space-y-3">
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
                          className="w-full h-14 rounded-2xl text-base gap-3 bg-white text-black hover:bg-white/90 shadow-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                          size="lg"
                          disabled={isSubmitting}
                        >
                          <Camera className="w-5 h-5" />
                          Share Memories
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          {!isSubmitting && (
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              variant="outline"
                              className="flex-1 h-12 rounded-xl border-white/10 text-white bg-white/5 hover:bg-white/10 hover:text-white"
                            >
                              Add More
                            </Button>
                          )}
                          <Button
                            onClick={handleSubmitMedia}
                            disabled={isSubmitting}
                            className={`h-12 rounded-xl gap-2 font-semibold transition-all shadow-lg ${
                              isSubmitting ? "w-full bg-primary/20 text-white/50" : "flex-1 bg-primary hover:bg-primary/90 text-white"
                            }`}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="h-full bg-primary absolute left-0 top-0 transition-all duration-300 opacity-20" style={{ width: `${totalProgress}%` }} />
                                <span className="relative z-10 flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Sending {totalProgress}%
                                </span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Push {selectedFiles.length}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comment Section */}
                  {memoryEvent.isMessagesEnabled && (
                    <div className="pt-2">
                      {!showCommentBox ? (
                        <Button
                          variant="ghost"
                          onClick={() => setShowCommentBox(true)}
                          className="w-full h-12 rounded-xl border border-white/10 text-white/80 bg-white/5 hover:bg-white/10 hover:text-white gap-2 transition-all"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Leave a Message
                        </Button>
                      ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <Textarea
                            placeholder="Write your celebration message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20 rounded-xl resize-none p-4"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => { setShowCommentBox(false); setMessage(""); }}
                              className="flex-1 h-11 rounded-xl text-white/60 hover:text-white hover:bg-white/5"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSubmitMessage}
                              disabled={!message.trim() || isSubmitting}
                              className="flex-1 h-11 rounded-xl gap-2 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg"
                            >
                              <Send className="w-4 h-4" />
                              {isSubmitting ? "Sending..." : "Publish"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>

          {/* Live Feed Section */}
          {memoryEvent.isLiveFeedEnabled && isEventStarted && (
            <div ref={feedRef} className="mt-16 w-full max-w-lg space-y-6 mx-auto relative px-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <button 
                  onClick={() => setShowLiveFeed(!showLiveFeed)}
                  className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 hover:text-white transition-colors py-2"
                >
                  <div className={`w-1.5 h-1.5 rounded-full bg-red-500 ${showLiveFeed ? 'animate-pulse' : ''}`} />
                  Live Event Feed {showLiveFeed ? '• On' : '• Off'}
                </button>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* New Activity Pill */}
              <AnimatePresence>
                {hasNewActivity && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: -20, x: "-50%" }}
                    className="fixed top-24 left-1/2 z-50"
                  >
                    <Button
                      onClick={() => {
                        window.scrollTo({ top: feedRef.current?.offsetTop ? feedRef.current.offsetTop - 100 : 0, behavior: 'smooth' });
                        setHasNewActivity(false);
                      }}
                      className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-6 shadow-2xl border border-white/20 gap-2 font-bold group"
                    >
                      <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                      New Memories Added!
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
          {showLiveFeed && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <LiveFeed items={feedItems} isLoading={isFeedLoading} />
            </motion.div>
          )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default GuestUpload;