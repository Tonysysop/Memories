import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Camera, 
  Video, 
  MessageSquare, 
  Upload,
  X,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MemoryEvent } from "@/types/event";
import { EVENT_TYPE_LABELS } from "@/types/event";
import { supabase } from "@/lib/supabase";

const GuestUpload = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const { toast } = useToast();
  const [event, setEvent] = useState<MemoryEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
        if (!shareCode) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('slug', shareCode)
                .single();

            if (error) throw error;

            if (data) {
                setEvent({
                    id: data.id,
                    hostId: data.user_id,
                    name: data.title,
                    type: data.event_type,
                    customType: data.custom_type,
                    coverImage: data.cover_image,
                    shareCode: data.slug,
                    createdAt: data.created_at,
                    eventDate: data.event_date,
                    isUploadsEnabled: data.is_uploads_enabled,
                    isMessagesEnabled: data.is_messages_enabled,
                    isLocked: data.is_locked,
                    uploads: []
                });
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchEvent();
  }, [shareCode]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      if (type === 'photo') return f.type.startsWith('image/');
      return f.type.startsWith('video/');
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitMedia = async () => {
    if (selectedFiles.length === 0 || !event) return;
    
    setIsSubmitting(true);
    
    try {
        let uploadedCount = 0;
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `events/${event.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('event-media')
            .upload(filePath, file);
            
          if (uploadError) {
              console.error('Upload error:', uploadError);
              continue;
          }

          const { data: publicUrlData } = supabase.storage
            .from('event-media')
            .getPublicUrl(filePath);

          const type = file.type.startsWith('image/') ? 'photo' : 'video';
          
          const { error: dbError } = await supabase.from('media').insert({
              event_id: event.id,
              file_url: publicUrlData.publicUrl,
              file_type: type,
              uploaded_by: guestName || 'Guest'
          });

          if (dbError) {
              console.error('DB Insert error:', dbError);
          } else {
              uploadedCount++;
          }
        }

        if (uploadedCount > 0) {
            toast({ title: "Upload complete!", description: `${uploadedCount} file(s) uploaded successfully.` });
            setSelectedFiles([]);
        } else {
            toast({ title: "Upload failed", description: "Could not upload files. Please try again.", variant: "destructive" });
        }

    } catch (error) {
        console.error('Error submitting media:', error);
        toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSubmitMessage = async () => {
    if (!message.trim() || !event) return;
    
    setIsSubmitting(true);
    
    try {
        const { error } = await supabase.from('messages').insert({
            event_id: event.id,
            message: message.trim(),
            name: guestName || 'Guest'
        });

        if (error) throw error;

        toast({ title: "Message sent!", description: "Your message has been added." });
        setMessage("");
    } catch (error) {
        console.error('Error sending message:', error);
        toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-display font-semibold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">
            This event doesn't exist or the link may be incorrect.
          </p>
        </div>
      </div>
    );
  }

  if (event.isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-display font-semibold mb-2">Event Locked</h1>
          <p className="text-muted-foreground">
            This event is no longer accepting new uploads.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground fill-current" />
            </div>
            <span className="font-display text-xl font-semibold">MEMORIES</span>
          </div>
          
          {event.coverImage && (
            <div className="aspect-video max-w-lg mx-auto rounded-xl overflow-hidden mb-6">
              <img 
                src={event.coverImage} 
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-display font-semibold mb-2">{event.name}</h1>
            <p className="text-muted-foreground">
              {event.type === 'other' && event.customType 
                ? event.customType 
                : EVENT_TYPE_LABELS[event.type]}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Guest Name */}
        <div className="mb-6">
          <Label htmlFor="guestName">Your Name (Optional)</Label>
          <Input
            id="guestName"
            placeholder="Enter your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="mt-2"
          />
        </div>

        {/* Upload Tabs */}
        <Tabs defaultValue="photo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {event.isUploadsEnabled && (
              <>
                <TabsTrigger value="photo" className="gap-2">
                  <Camera className="w-4 h-4" />
                  Photo
                </TabsTrigger>
                <TabsTrigger value="video" className="gap-2">
                  <Video className="w-4 h-4" />
                  Video
                </TabsTrigger>
              </>
            )}
            {event.isMessagesEnabled && (
              <TabsTrigger value="message" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </TabsTrigger>
            )}
          </TabsList>

          {event.isUploadsEnabled && (
            <>
              <TabsContent value="photo" className="mt-6">
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer transition-colors bg-muted/50">
                    <Camera className="w-12 h-12 text-muted-foreground mb-3" />
                    <span className="text-muted-foreground font-medium">Tap to add photos</span>
                    <span className="text-xs text-muted-foreground mt-1">or take a new one</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, 'photo')}
                    />
                  </label>

                  {selectedFiles.filter(f => f.type.startsWith('image/')).length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedFiles.filter(f => f.type.startsWith('image/')).map((file, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 w-6 h-6"
                            onClick={() => removeFile(selectedFiles.indexOf(file))}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    className="w-full gap-2" 
                    disabled={selectedFiles.filter(f => f.type.startsWith('image/')).length === 0 || isSubmitting}
                    onClick={handleSubmitMedia}
                  >
                    <Upload className="w-4 h-4" />
                    {isSubmitting ? "Uploading..." : "Upload Photos"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="video" className="mt-6">
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer transition-colors bg-muted/50">
                    <Video className="w-12 h-12 text-muted-foreground mb-3" />
                    <span className="text-muted-foreground font-medium">Tap to add video</span>
                    <span className="text-xs text-muted-foreground mt-1">or record a new one</span>
                    <input
                      type="file"
                      accept="video/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, 'video')}
                    />
                  </label>

                  {selectedFiles.filter(f => f.type.startsWith('video/')).length > 0 && (
                    <div className="space-y-2">
                      {selectedFiles.filter(f => f.type.startsWith('video/')).map((file, i) => (
                        <div key={i} className="flex items-center gap-2 bg-muted rounded-lg p-2">
                          <Video className="w-4 h-4 text-muted-foreground" />
                          <span className="flex-1 truncate text-sm">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => removeFile(selectedFiles.indexOf(file))}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    className="w-full gap-2" 
                    disabled={selectedFiles.filter(f => f.type.startsWith('video/')).length === 0 || isSubmitting}
                    onClick={handleSubmitMedia}
                  >
                    <Upload className="w-4 h-4" />
                    {isSubmitting ? "Uploading..." : "Upload Video"}
                  </Button>
                </div>
              </TabsContent>
            </>
          )}

          {event.isMessagesEnabled && (
            <TabsContent value="message" className="mt-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Write your message or well-wishes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                />
                <Button 
                  className="w-full gap-2" 
                  disabled={!message.trim() || isSubmitting}
                  onClick={handleSubmitMessage}
                >
                  <MessageSquare className="w-4 h-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default GuestUpload;