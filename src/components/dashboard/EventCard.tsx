import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Image as ImageIcon, 
  MessageSquare, 
  MoreVertical,
  Eye,
  Trash2,
  Lock,
  Unlock
} from "lucide-react";
import type { MemoryEvent } from "@/types/event";
import { EVENT_TYPE_LABELS } from "@/types/event";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isValid } from "date-fns";

interface EventCardProps {
  event: MemoryEvent;
  onView: (event: MemoryEvent) => void;
  onDelete: (eventId: string) => void;
  onToggleLock: (eventId: string, isLocked: boolean) => void;
}

const EventCard = ({ event, onView, onDelete, onToggleLock }: EventCardProps) => {
  const photoCount = event.uploads.filter(u => u.type === 'photo').length;
  const videoCount = event.uploads.filter(u => u.type === 'video').length;
  const messageCount = event.uploads.filter(u => u.type === 'message').length;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-24 bg-muted flex items-center justify-center overflow-hidden">
        {event.coverImage ? (
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-background shadow-sm">
            <img 
              src={event.coverImage} 
              alt={event.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
        )}
        {event.isLocked && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="gap-1">
              <Lock className="w-3 h-3" />
              Locked
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 pt-2 pb-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate leading-tight">{event.name}</h3>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
              {event.type === 'other' && event.customType 
                ? event.customType 
                : EVENT_TYPE_LABELS[event.type]}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(event)}>
                <Eye className="w-4 h-4 mr-2" />
                View Event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleLock(event.id, !event.isLocked)}>
                {event.isLocked ? (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Event
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Lock Event
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(event.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ImageIcon className="w-4 h-4" />
            {photoCount + videoCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {messageCount}
          </span>
          {event.eventDate && isValid(new Date(event.eventDate)) && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(event.eventDate), 'MMM d')}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0">
        <Button 
          variant="secondary" 
          size="sm"
          className="w-full h-8 text-xs"
          onClick={() => onView(event)}
        >
          Manage
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;