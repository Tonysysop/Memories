import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EventType } from "@/types/event";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/imageUtils";
import { Upload, X, Image as ImageIcon, Eye, Share2, Trash2 } from "lucide-react";
import { EVENT_TYPE_LABELS } from "@/types/event";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    name: string;
    type: EventType;
    customType?: string;
    coverImage?: string;
    eventDate?: string;
  }) => void;
}

const CreateEventDialog = ({ open, onOpenChange, onCreate }: CreateEventDialogProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<EventType>("birthday");
  const [customType, setCustomType] = useState("");
  const [date, setDate] = useState("");
  
  // Cropper state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setIsCropDialogOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
        setCroppedImage(cropped);
        setIsCropDialogOpen(false);
        setImageSrc(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name,
      type,
      customType: type === "other" ? customType : undefined,
      eventDate: date || undefined,
      coverImage: croppedImage || undefined,
    });
    // Reset form
    setName("");
    setType("birthday");
    setCustomType("");
    setDate("");
    setCroppedImage(null);
    setImageSrc(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] bg-background/95 backdrop-blur-xl border-border/50 p-0 overflow-hidden">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Form Section */}
            <div className="flex-1 p-6 lg:border-r border-border/50">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-display font-bold">Create New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                    Event Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Mom's 60th Birthday"
                    required
                    className="h-11 bg-muted/50 border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                      Event Type
                    </Label>
                    <Select value={type} onValueChange={(value) => setType(value as EventType)}>
                      <SelectTrigger className="h-11 bg-muted/50 border-border/50">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="memorial">Memorial</SelectItem>
                        <SelectItem value="trip">Trip</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                      Event Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-11 bg-muted/50 border-border/50"
                    />
                  </div>
                </div>

                {type === "other" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <Label htmlFor="customType" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                      Custom Type
                    </Label>
                    <Input
                      id="customType"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      placeholder="Ex: Graduation"
                      required
                      className="h-11 bg-muted/50 border-border/50"
                    />
                  </motion.div>
                )}

                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Cover Image</Label>
                  {croppedImage ? (
                    <div className="relative group rounded-2xl overflow-hidden border-2 border-primary/20 aspect-[21/9] w-full bg-muted">
                      <img src={croppedImage} alt="Cropped" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => setCroppedImage(null)}
                          className="h-8 w-8 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-24 border-dashed border-2 flex flex-col gap-2 hover:bg-muted/50 hover:border-primary/50 transition-all rounded-2xl"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Upload Hero Photo</span>
                    </Button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl mt-6">
                  Create Event
                </Button>
              </form>
            </div>

            {/* Preview Section */}
            <div className="hidden lg:flex w-[280px] bg-muted/30 p-6 flex-col items-center justify-center gap-6">
              <div className="w-full text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Preview</p>
                <p className="text-xs text-muted-foreground font-medium">How your event will look</p>
              </div>

              <div className="w-full perspective-[1000px]">
                <motion.div
                  animate={{ 
                    rotateY: name ? 0 : 5,
                    rotateX: name ? 0 : 2
                  }}
                  className="w-full shadow-2xl rounded-2xl overflow-hidden border border-border/50 bg-card overflow-hidden"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {croppedImage ? (
                      <img
                        src={croppedImage}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    
                    {/* Action Overlay simulation */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity bg-background/20 backdrop-blur-[2px]">
                      <div className="h-7 w-7 rounded-full bg-primary/80 flex items-center justify-center"><Eye className="h-3.5 w-3.5 text-white" /></div>
                      <div className="h-7 w-7 rounded-full bg-indigo-500/80 flex items-center justify-center"><Share2 className="h-3.5 w-3.5 text-white" /></div>
                      <div className="h-7 w-7 rounded-full bg-destructive/80 flex items-center justify-center"><Trash2 className="h-3.5 w-3.5 text-white" /></div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-base font-bold tracking-tight truncate">
                      {name || "Event Name"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {date ? format(new Date(date), 'MMM d, yyyy') : "No date set"} • 0 items
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      <Badge variant="secondary" className="bg-secondary/50 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider">
                        {type === 'other' && customType ? customType : EVENT_TYPE_LABELS[type as EventType]}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-full border border-primary/10">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-bold text-primary/70 uppercase tracking-widest">Real-time update</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none bg-black">
          <div className="relative h-[400px] w-full">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="p-4 bg-background border-t">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zoom</Label>
                <span className="text-xs font-medium">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground font-medium">Crop your event photo</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCropDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCropSave}>
                  Save & Apply
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateEventDialog;