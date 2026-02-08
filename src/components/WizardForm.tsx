import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  FileCheck,
  Calendar,
  Settings,
  Heart,
  MapPin,
  Clock,
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useRef } from "react";
import type { EventType } from "@/types/event";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/imageUtils";
import { DatePicker } from "./DatePicker";
import TimerPicker from "./TimerPicker";
import { parseISO, setHours, setMinutes } from "date-fns";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const contentVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ============================================================================
// COMPONENTS
// ============================================================================

function SidebarStep({
  step,
  currentStep,
  steps,
}: {
  step: any;
  currentStep: number;
  steps: any[];
}) {
  const Icon = step.icon;
  const isCompleted = currentStep > step.id;
  const isCurrent = currentStep === step.id;

  return (
    <div className="relative flex items-center gap-4 py-4 px-2">
      {/* Vertical Line */}
      {step.id !== steps.length && (
        <div className="absolute left-[26px] top-10 h-full w-[2px] bg-border/20">
          <motion.div
            className="h-full w-full bg-primary"
            initial={{ height: "0%" }}
            animate={{ height: isCompleted ? "100%" : "0%" }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* Icon Bubble */}
      <motion.div
        className={cn(
          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
          isCompleted
            ? "border-primary bg-primary text-primary-foreground scale-90"
            : isCurrent
              ? "border-primary bg-background text-primary shadow-[0_0_0_4px_rgba(var(--primary),0.1)]"
              : "border-border/30 bg-background/50 text-muted-foreground"
        )}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" strokeWidth={3} />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </motion.div>

      {/* Text Info */}
      <div className="flex flex-col">
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-wider transition-colors duration-300",
            isCurrent || isCompleted
              ? "text-foreground"
              : "text-muted-foreground/50"
          )}
        >
          {step.name}
        </span>
      </div>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label
        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
      >
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border-border/40 bg-muted/30 focus:bg-muted/50 transition-all font-medium"
      />
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface WizardFormProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  isEdit?: boolean;
}

export function WizardForm({ onComplete, onCancel, initialData, isEdit = false }: WizardFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: (initialData?.type || "wedding") as EventType,
    eventDate: initialData?.eventDate || "",
    groomFirstName: initialData?.groomFirstName || "",
    groomLastName: initialData?.groomLastName || "",
    brideFirstName: initialData?.brideFirstName || "",
    brideLastName: initialData?.brideLastName || "",
    religiousRiteVenue: initialData?.religiousRiteVenue || "",
    religiousRiteStartTime: initialData?.religiousRiteStartTime ? new Date(initialData.religiousRiteStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "",
    religiousRiteEndTime: initialData?.religiousRiteEndTime ? new Date(initialData.religiousRiteEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "",
    receptionVenue: initialData?.receptionVenue || "",
    receptionStartTime: initialData?.receptionStartTime ? new Date(initialData.receptionStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "",
    receptionEndTime: initialData?.receptionEndTime ? new Date(initialData.receptionEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "",
    isLocationPublic: initialData?.isLocationPublic ?? true,
    coverImage: initialData?.coverImage || "",
  });

  // Cropper state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const cropped = await getCroppedImg(imageSrc as string, croppedAreaPixels);
        if (cropped) {
          setFormData({ ...formData, coverImage: cropped });
        }
        setIsCropping(false);
        setImageSrc(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isWedding = formData.type === "wedding";

  const STEPS = [
    { id: 1, name: "Basics", icon: Calendar },
    ...(isWedding ? [
      { id: 2, name: "Couple", icon: Heart },
      { id: 3, name: "Religious", icon: MapPin },
      { id: 4, name: "Reception", icon: Clock },
    ] : []),
    { id: isWedding ? 5 : 2, name: "Photo", icon: Camera },
    { id: isWedding ? 6 : 3, name: "Visibility", icon: Settings },
    { id: isWedding ? 7 : 4, name: "Review", icon: FileCheck },
  ];

  const combineDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return undefined;
    try {
      const date = parseISO(dateStr);
      const [hours, minutes] = timeStr.split(':').map(Number);
      return setMinutes(setHours(date, hours), minutes).toISOString();
    } catch (e) {
      console.error("Error combining date and time:", e);
      return undefined;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Transform time fields to full ISO timestamps before completion
      const finalData = {
        ...formData,
        religiousRiteStartTime: combineDateTime(formData.eventDate, formData.religiousRiteStartTime),
        religiousRiteEndTime: combineDateTime(formData.eventDate, formData.religiousRiteEndTime),
        receptionStartTime: combineDateTime(formData.eventDate, formData.receptionStartTime),
        receptionEndTime: combineDateTime(formData.eventDate, formData.receptionEndTime),
      };
      onComplete(finalData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const canGoNext = () => {
    const isWedding = formData.type === "wedding";
    
    // Step 1: Basics
    if (currentStep === 1) {
      return !!formData.name && !!formData.eventDate;
    }

    if (isWedding) {
      // Step 2: Couple
      if (currentStep === 2) {
        return !!formData.groomFirstName && !!formData.groomLastName && 
               !!formData.brideFirstName && !!formData.brideLastName;
      }
      // Step 3: Religious Rite (Optional)
      if (currentStep === 3) {
        return true;
      }
      // Step 4: Reception (Required)
      if (currentStep === 4) {
        return !!formData.receptionVenue && !!formData.receptionStartTime && !!formData.receptionEndTime;
      }
      // Step 5: Photo
      if (currentStep === 5) {
        return !!formData.coverImage;
      }
    } else {
      // Non-wedding Step 2: Photo
      if (currentStep === 2) {
        return !!formData.coverImage;
      }
    }

    return true; // Other steps (Visibility, Review) are always valid
  };

  const currentStepData = STEPS[currentStep - 1];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl sm:rounded-3xl border border-border/40 bg-background/60 backdrop-blur-2xl shadow-2xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <div className="hidden lg:block bg-muted/30 p-6 border-r border-border/40 space-y-4">
          <div className="mb-8">
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5">
              Event Setup
            </Badge>
          </div>
          <div className="space-y-1">
            {STEPS.map((step) => (
              <SidebarStep
                key={step.id}
                step={step}
                currentStep={currentStep}
                steps={STEPS}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col min-h-[500px]">
          {/* Mobile Header */}
          <div className="lg:hidden p-6 border-b border-border/40 bg-muted/20">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Step {currentStep} of {STEPS.length}</p>
                <h3 className="text-lg font-bold">{currentStepData.name}</h3>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary">
                <currentStepData.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <div className="flex-1 p-6 sm:p-8 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-display font-bold tracking-tight">
                    {currentStepData.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please provide the following information for your event.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Step 1: Basics */}
                  {currentStep === 1 && (
                    <div className="grid gap-6">
                      <InputField 
                        label="Event Name" 
                        placeholder="Ex: Tony & Clara's Wedding" 
                        value={formData.name}
                        onChange={(val) => setFormData({...formData, name: val})}
                        required
                      />
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Event Type</Label>
                          <Select 
                            value={formData.type} 
                            onValueChange={(val: EventType) => {
                              setFormData({...formData, type: val});
                              if (val !== 'wedding' && currentStep > 2) setCurrentStep(2);
                            }}
                          >
                            <SelectTrigger className="h-11 rounded-xl border-border/40 bg-muted/30">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="wedding">Wedding</SelectItem>
                              <SelectItem value="birthday">Birthday</SelectItem>
                              <SelectItem value="anniversary">Anniversary</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                            Main Event Date <span className="text-primary">*</span>
                          </Label>
                          <DatePicker 
                            date={formData.eventDate ? new Date(formData.eventDate) : undefined}
                            onChange={(date) => setFormData({...formData, eventDate: date?.toISOString() || ""})}
                            placeholder="Select Date"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wedding Specific: Step 2: Couple */}
                  {isWedding && currentStep === 2 && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-primary/60">Groom Information</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <InputField 
                            label="First Name" 
                            placeholder="John" 
                            value={formData.groomFirstName}
                            onChange={(val) => setFormData({...formData, groomFirstName: val})}
                            required
                          />
                          <InputField 
                            label="Last Name" 
                            placeholder="Smith" 
                            value={formData.groomLastName}
                            onChange={(val) => setFormData({...formData, groomLastName: val})}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-primary/60">Bride Information</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <InputField 
                            label="First Name" 
                            placeholder="Jane" 
                            value={formData.brideFirstName}
                            onChange={(val) => setFormData({...formData, brideFirstName: val})}
                            required
                          />
                          <InputField 
                            label="Last Name" 
                            placeholder="Doe" 
                            value={formData.brideLastName}
                            onChange={(val) => setFormData({...formData, brideLastName: val})}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wedding Specific: Step 3: Religious Rite */}
                  {isWedding && currentStep === 3 && (
                    <div className="space-y-6">
                      <InputField 
                        label="Religious Rite Venue" 
                        placeholder="Ex: St. Peters Cathedral" 
                        value={formData.religiousRiteVenue}
                        onChange={(val) => setFormData({...formData, religiousRiteVenue: val})}
                      />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Start Time</Label>
                          <TimerPicker 
                            value={formData.religiousRiteStartTime}
                            onChange={(val) => setFormData({...formData, religiousRiteStartTime: val})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">End Time</Label>
                          <TimerPicker 
                            value={formData.religiousRiteEndTime}
                            onChange={(val) => setFormData({...formData, religiousRiteEndTime: val})}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wedding Specific: Step 4: Reception */}
                  {isWedding && currentStep === 4 && (
                    <div className="space-y-6">
                      <InputField 
                        label="Party Venue (Reception)" 
                        placeholder="Ex: Grand Plaza Hotel" 
                        value={formData.receptionVenue}
                        onChange={(val) => setFormData({...formData, receptionVenue: val})}
                        required
                      />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                            Start Time <span className="text-primary">*</span>
                          </Label>
                          <TimerPicker 
                            value={formData.receptionStartTime}
                            onChange={(val) => setFormData({...formData, receptionStartTime: val})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                            End Time <span className="text-primary">*</span>
                          </Label>
                          <TimerPicker 
                            value={formData.receptionEndTime}
                            onChange={(val) => setFormData({...formData, receptionEndTime: val})}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step Photo (5 for Wedding, 2 for Others) */}
                  {((isWedding && currentStep === 5) || (!isWedding && currentStep === 2)) && (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center gap-6">
                        {formData.coverImage ? (
                          <div className="relative group w-full aspect-[21/9] rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted">
                            <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-9 rounded-full px-6 font-bold uppercase tracking-wider text-[10px]"
                              >
                                Change Photo
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => setFormData({ ...formData, coverImage: "" })}
                                className="h-9 w-9 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-48 border-dashed border-2 flex flex-col gap-3 hover:bg-muted/50 hover:border-primary/50 transition-all rounded-3xl"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                              <Camera className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-center">
                              <span className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-black block">
                                Upload Hero Photo <span className="text-primary">*</span>
                              </span>
                              <span className="text-[10px] text-muted-foreground/60 mt-1 block font-medium italic">Recommended: 1200x500px</span>
                            </div>
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
                      
                      {/* Cropping Dialog Content */}
                      {isCropping && (
                        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
                          <div className="relative flex-1">
                            <Cropper
                              image={imageSrc || ""}
                              crop={crop}
                              zoom={zoom}
                              aspect={21 / 9}
                              onCropChange={setCrop}
                              onCropComplete={onCropComplete}
                              onZoomChange={setZoom}
                            />
                          </div>
                          <div className="p-6 bg-background border-t border-border/40">
                            <div className="max-w-md mx-auto space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Zoom Level</Label>
                                <span className="text-xs font-bold text-primary">{Math.round(zoom * 100)}%</span>
                              </div>
                              <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                              />
                              <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setIsCropping(false)}>Cancel</Button>
                                <Button className="flex-1 rounded-full shadow-lg shadow-primary/20" onClick={handleCropSave}>Save & Apply</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step Visibility (6 for Wedding, 3 for Others) */}
                  {((isWedding && currentStep === 6) || (!isWedding && currentStep === 3)) && (
                    <div className="space-y-8">
                       <div className="p-6 rounded-2xl bg-muted/30 border border-border/40">
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h3 className="text-lg font-bold flex items-center gap-2">
                                {formData.isLocationPublic ? <Eye className="w-5 h-5 text-primary" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
                                Location Visibility
                              </h3>
                              <p className="text-sm text-muted-foreground max-w-sm">
                                Choose whether to disclose the event location details on your public event webpage.
                              </p>
                            </div>
                            <Switch 
                              checked={formData.isLocationPublic}
                              onCheckedChange={(val) => setFormData({...formData, isLocationPublic: val})}
                            />
                          </div>
                       </div>
                    </div>
                  )}

                  {/* Step Review (7 for Wedding, 4 for Others) */}
                  {((isWedding && currentStep === 7) || (!isWedding && currentStep === 4)) && (
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                         <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Summary</h3>
                         <div className="space-y-1">
                            <ReviewItem label="Event Name" value={formData.name} />
                            <ReviewItem label="Type" value={formData.type} />
                            <ReviewItem label="Date" value={formData.eventDate} />
                            {isWedding && (
                              <>
                                <ReviewItem label="Groom" value={`${formData.groomFirstName} ${formData.groomLastName}`} />
                                <ReviewItem label="Bride" value={`${formData.brideFirstName} ${formData.brideLastName}`} />
                                <ReviewItem label="Ceremony" value={formData.religiousRiteVenue} />
                                <ReviewItem label="Reception" value={formData.receptionVenue} />
                              </>
                            )}
                            <ReviewItem label="Location Visibility" value={formData.isLocationPublic ? "Public" : "Private"} />
                            <ReviewItem label="Cover Image" value={formData.coverImage ? "Uploaded" : "No image"} />
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-12 flex items-center justify-between border-t border-border/10 pt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-2 h-11 px-6 rounded-full font-bold uppercase tracking-wider text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="gap-2 h-11 px-8 rounded-full font-bold uppercase tracking-wider text-xs shadow-xl shadow-primary/20"
            >
              {currentStep === STEPS.length ? (
                <>
                  {isEdit ? "Update Event" : "Create Event"}
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
