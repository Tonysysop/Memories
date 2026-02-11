import { useEvents } from "@/hooks/useEvent";
import { useNavigate } from "react-router-dom";
import EventCard from "@/components/dashboard/EventCard";
import EventList from "@/components/dashboard/EventList";
import DeleteEventDialog from "@/components/dashboard/DeleteEventDialog";
import QuickShareDialog from "@/components/dashboard/QuickShareDialog";
import { Calendar, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MemoryEvent } from "@/types/event";
import { useState } from "react";

const DashboardEvents = () => {
  const { events, isLoading: eventsLoading, updateEvent } = useEvents();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({
    isOpen: false,
    id: "",
    name: "",
  });
  const [shareDialog, setShareDialog] = useState<{
    isOpen: boolean;
    event: { id: string; name: string; shareCode: string } | null;
  }>({
    isOpen: false,
    event: null,
  });

  const handleViewEvent = (event: MemoryEvent) => {
    navigate(`/dashboard/event/${event.id}`);
  };

  const handleDeleteEvent = (id: string) => {
    const event = events.find((e) => e.id === id);
    if (event) {
      setDeleteDialog({ isOpen: true, id, name: event.name });
    }
  };

  const handleToggleLock = (eventId: string, isLocked: boolean) => {
    updateEvent(eventId, { isLocked });
  };

  const handleShareEvent = (event: MemoryEvent) => {
    setShareDialog({
      isOpen: true,
      event: { id: event.id, name: event.name, shareCode: event.shareCode },
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold">My Events</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your events in one place
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={cn(
              "h-8 px-3 gap-2 rounded-lg transition-all",
              viewMode === "grid"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Grid
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={cn(
              "h-8 px-3 gap-2 rounded-lg transition-all",
              viewMode === "list"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              List
            </span>
          </Button>
        </div>
      </div>

      {eventsLoading ? (
        <div className="text-center py-12 text-muted-foreground whitespace-pre-wrap">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded-xl w-full" />
            <div className="h-10 bg-muted rounded-xl w-full" />
            <div className="h-10 bg-muted rounded-xl w-full" />
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-6">
            Everything you create will appear here.
          </p>
        </div>
      ) : viewMode === "list" ? (
        <EventList
          events={events}
          onView={handleViewEvent}
          onDelete={handleDeleteEvent}
          onToggleLock={handleToggleLock}
          onShare={handleShareEvent}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onView={handleViewEvent}
              onDelete={handleDeleteEvent}
              onToggleLock={handleToggleLock}
              onShare={handleShareEvent}
            />
          ))}
        </div>
      )}

      <DeleteEventDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
        eventId={deleteDialog.id}
        eventName={deleteDialog.name}
      />

      <QuickShareDialog
        isOpen={shareDialog.isOpen}
        onClose={() => setShareDialog((prev) => ({ ...prev, isOpen: false }))}
        event={shareDialog.event}
      />
    </div>
  );
};

export default DashboardEvents;
