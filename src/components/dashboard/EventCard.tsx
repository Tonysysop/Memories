import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Eye, Lock, Unlock, Trash2, Image as ImageIcon } from "lucide-react";
import type { MemoryEvent } from "@/types/event";
import { EVENT_TYPE_LABELS } from "@/types/event";
import { format, isValid } from "date-fns";

interface EventCardProps {
  event: MemoryEvent;
  onView: (event: MemoryEvent) => void;
  onDelete: (eventId: string) => void;
  onToggleLock: (eventId: string, isLocked: boolean) => void;
  className?: string;
}

const EventCard = ({
  event,
  onView,
  onDelete,
  onToggleLock,
  className,
}: EventCardProps) => {
  const photoCount = event.uploads.filter((u) => u.type === 'photo').length;
  const videoCount = event.uploads.filter((u) => u.type === 'video').length;
  const messageCount = event.uploads.filter((u) => u.type === 'message').length;
  const totalItems = photoCount + videoCount + messageCount;

  const formattedDate =
    event.eventDate && isValid(new Date(event.eventDate))
      ? format(new Date(event.eventDate), 'MMM d, yyyy')
      : null;

  const description = [
    formattedDate,
    `${totalItems} memory items`
  ].filter(Boolean).join(" • ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("w-full", className)}
    >
      <Card className="group relative h-full overflow-hidden rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {event.coverImage ? (
            <motion.img
              src={event.coverImage}
              alt={event.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <motion.button
              onClick={() => onView(event)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 backdrop-blur-md transition-colors hover:bg-primary/90"
              title="View Event"
            >
              <Eye className="h-5 w-5" />
            </motion.button>

            <motion.button
              onClick={() => onToggleLock(event.id, !event.isLocked)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-secondary/80"
              title={event.isLocked ? "Unlock Event" : "Lock Event"}
            >
              {event.isLocked ? (
                <Unlock className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </motion.button>

            <motion.button
              onClick={() => onDelete(event.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-destructive/90"
              title="Delete Event"
            >
              <Trash2 className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        <div className="p-5">
          <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary truncate">
            {event.name}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-secondary/50 px-2 py-0.5 text-xs font-normal hover:bg-secondary"
            >
              {event.type === 'other' && event.customType
                ? event.customType
                : EVENT_TYPE_LABELS[event.type]}
            </Badge>
            {event.isLocked && (
              <Badge
                variant="outline"
                className="border-primary/50 text-primary px-2 py-0.5 text-xs font-normal"
              >
                Locked
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EventCard;