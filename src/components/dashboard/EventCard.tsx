import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Lock,
  Unlock,
  Trash2,
  Image as ImageIcon,
  Calendar,
  MapPin,
  QrCode,
  Settings,
  Play,
} from "lucide-react";
import type { MemoryEvent } from "@/types/event";
import { format, isValid } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EventCardProps {
  event: MemoryEvent;
  onView: (event: MemoryEvent) => void;
  onDelete: (eventId: string) => void;
  onToggleLock: (eventId: string, isLocked: boolean) => void;
  onShare?: (event: MemoryEvent) => void;
  className?: string;
}

const EventCard = ({
  event,
  onView,
  onDelete,
  onToggleLock,
  onShare,
  className,
}: EventCardProps) => {
  const photoCount = event.uploads.filter((u) => u.type === "photo").length;
  const videoCount = event.uploads.filter((u) => u.type === "video").length;
  const messageCount = event.uploads.filter((u) => u.type === "message").length;
  const giftCount = event.uploads.filter((u) => u.type === "gift").length;

  const totalPhotos = photoCount + videoCount;

  const formattedDate =
    event.eventDate && isValid(new Date(event.eventDate))
      ? format(new Date(event.eventDate), "MMMM d, yyyy")
      : "No date set";

  const location =
    event.receptionVenue || event.religiousRiteVenue || "No location set";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("w-full", className)}
    >
      <Card className="group relative overflow-hidden rounded-[2.5rem] border-none bg-[#2D1B22] p-6 text-white shadow-2xl transition-all duration-300 hover:shadow-primary/5">
        {/* Cover Image */}
        <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-3xl bg-muted/10">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/20">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}

          {/* Live Now Badge */}
          {event.isLiveFeedEnabled && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-[#E31D31] hover:bg-[#E31D31] text-white border-none px-3 py-1 font-bold tracking-wider text-[10px] sm:text-xs text-center">
                LIVE NOW
              </Badge>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="mb-6 space-y-2 px-1">
          <h3 className="text-2xl font-bold tracking-tight text-white line-clamp-1">
            {event.name}
          </h3>
          <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="truncate">{formattedDate}</span>
            <span className="mx-1 shrink-0">•</span>
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-start justify-center rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <span className="text-2xl font-black text-[#E31D31]">
              {totalPhotos}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase mt-1">
              Photos
            </span>
          </div>
          <div className="flex flex-col items-start justify-center rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <span className="text-2xl font-black text-[#E31D31]">
              {giftCount}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase mt-1">
              Gifts
            </span>
          </div>
          <div className="flex flex-col items-start justify-center rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <span className="text-2xl font-black text-[#E31D31]">
              {messageCount}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase mt-1">
              Comments
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto border-t border-white/10 pt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onShare?.(event)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white"
              title="Share QR Code"
            >
              <QrCode className="h-6 w-6" />
            </button>
            <button
              onClick={() => onView(event)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 font-bold text-white transition-all hover:bg-white/20"
            >
              <Play className="h-5 w-5 fill-current" />
              Manage Event
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white"
                  title="Event Settings"
                >
                  <Settings className="h-6 w-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-2xl border-white/10 bg-[#2D1B22] p-2 text-white backdrop-blur-xl"
              >
                <DropdownMenuItem
                  onClick={() => onToggleLock(event.id, !event.isLocked)}
                  className="flex items-center gap-2 rounded-xl py-2 cursor-pointer focus:bg-white/10 focus:text-white"
                >
                  {event.isLocked ? (
                    <>
                      <Unlock className="h-4 w-4 text-green-400" />
                      <span>Unlock Event</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-amber-400" />
                      <span>Lock Event</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => onDelete(event.id)}
                  className="flex items-center gap-2 rounded-xl py-2 cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Event</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EventCard;
