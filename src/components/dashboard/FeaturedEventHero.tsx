import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Share2, ExternalLink, Camera, Sparkles } from "lucide-react";
import type { MemoryEvent } from "@/types/event";
import { EVENT_TYPE_LABELS } from "@/types/event";
import { format, isValid } from "date-fns";

interface FeaturedEventHeroProps {
  event: MemoryEvent;
  onShare: (event: MemoryEvent) => void;
  onView: (event: MemoryEvent) => void;
}

const FeaturedEventHero = ({
  event,
  onShare,
  onView,
}: FeaturedEventHeroProps) => {
  const formattedDate =
    event.eventDate && isValid(new Date(event.eventDate))
      ? format(new Date(event.eventDate), "MMMM do, yyyy")
      : "Date not set";

  const photoCount = event.uploads.filter((u) => u.type === "photo").length;
  const videoCount = event.uploads.filter((u) => u.type === "video").length;
  const totalMedia = photoCount + videoCount;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-border/50 bg-card group">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 lg:p-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 min-h-[400px]">
        <div className="space-y-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-widest font-black"
              >
                Featured Event
              </Badge>
              {!event.isLocked && (
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-500 border-green-500/20 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-widest font-black"
                >
                  Live Now
                </Badge>
              )}
            </div>

            <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-foreground">
              {event.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {totalMedia} Memories Collected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">
                  {EVENT_TYPE_LABELS[event.type]}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Button
              size="lg"
              className="rounded-xl px-8 font-bold gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all"
              onClick={() => onView(event)}
            >
              <ExternalLink className="w-4 h-4" />
              Manage Event
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl px-8 font-bold gap-2 bg-background/50 backdrop-blur-md border-border/50 hover:bg-background/80 active:scale-95 transition-all"
              onClick={() => onShare(event)}
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </Button>
          </motion.div>
        </div>

        {/* Floating Stat Card (Optional/Visual) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:block bg-background/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl w-64"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Guest Interaction
              </p>
              <p className="text-sm font-bold">Highly Engaged</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                className="h-full bg-primary"
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              Popularity among guests is higher than average for{" "}
              {EVENT_TYPE_LABELS[event.type]} events.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedEventHero;
