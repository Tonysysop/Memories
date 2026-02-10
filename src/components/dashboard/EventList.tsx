import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Lock,
  Unlock,
  Trash2,
  Share2,
  MoreHorizontal,
  ChevronRight,
  Image as ImageIcon,
  MessageSquare,
  Gift,
} from "lucide-react";
import type { MemoryEvent } from "@/types/event";
import { EVENT_TYPE_LABELS } from "@/types/event";
import { format, isValid } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface EventListProps {
  events: MemoryEvent[];
  onView: (event: MemoryEvent) => void;
  onDelete: (eventId: string) => void;
  onToggleLock: (eventId: string, isLocked: boolean) => void;
  onShare: (event: MemoryEvent) => void;
}

const EventList = ({
  events,
  onView,
  onDelete,
  onToggleLock,
  onShare,
}: EventListProps) => {
  return (
    <div className="w-full bg-card rounded-2xl border border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Event
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                Type/Status
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                Engagement
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {events.map((event, index) => {
              const photoCount = event.uploads.filter(
                (u) => u.type === "photo",
              ).length;
              const videoCount = event.uploads.filter(
                (u) => u.type === "video",
              ).length;
              const messageCount = event.uploads.filter(
                (u) => u.type === "message",
              ).length;
              const giftCount = event.uploads.filter(
                (u) => u.type === "gift",
              ).length;

              const formattedDate =
                event.eventDate && isValid(new Date(event.eventDate))
                  ? format(new Date(event.eventDate), "MMM d, yyyy")
                  : "No date";

              return (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onView(event)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                        {event.coverImage ? (
                          <img
                            src={event.coverImage}
                            alt={event.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {event.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formattedDate}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-secondary/50 font-normal px-2 py-0"
                      >
                        {EVENT_TYPE_LABELS[event.type]}
                      </Badge>
                      {event.isLocked && (
                        <Badge
                          variant="outline"
                          className="border-primary/20 text-primary px-2 py-0 text-[10px] uppercase font-black"
                        >
                          Locked
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        title="Media"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="font-medium text-foreground">
                          {photoCount + videoCount}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        title="Messages"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-medium text-foreground">
                          {messageCount}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        title="Gifts"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span className="font-medium text-foreground">
                          {giftCount}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div
                      className="flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hidden sm:flex text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => onShare(event)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-muted-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl p-2 backdrop-blur-xl bg-background/95 border-border/50"
                        >
                          <DropdownMenuItem
                            onClick={() => onView(event)}
                            className="rounded-lg py-2 cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-2 text-primary" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onShare(event)}
                            className="rounded-lg py-2 cursor-pointer sm:hidden"
                          >
                            <Share2 className="w-4 h-4 mr-2 text-indigo-500" />
                            Share Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              onToggleLock(event.id, !event.isLocked)
                            }
                            className="rounded-lg py-2 cursor-pointer"
                          >
                            {event.isLocked ? (
                              <>
                                <Unlock className="w-4 h-4 mr-2 text-green-500" />
                                Unlock Event
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4 mr-2 text-amber-500" />
                                Lock Event
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 border-border/50" />
                          <DropdownMenuItem
                            onClick={() => onDelete(event.id)}
                            className="rounded-lg py-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full sm:flex text-muted-foreground hover:text-primary"
                        onClick={() => onView(event)}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventList;
