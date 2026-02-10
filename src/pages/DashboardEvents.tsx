import { useEvents } from "@/hooks/useEvent";
import { useNavigate } from "react-router-dom";
import EventCard from "@/components/dashboard/EventCard";
import DeleteEventDialog from "@/components/dashboard/DeleteEventDialog";
import { Calendar } from "lucide-react";
import type { MemoryEvent } from "@/types/event";
import { useState } from "react";
import QuickShareDialog from "@/components/dashboard/QuickShareDialog";

const DashboardEvents = () => {
  const { events, isLoading: eventsLoading, updateEvent } = useEvents();
  const navigate = useNavigate();

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">My Events</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your events
        </p>
      </div>

      {eventsLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-6">
            Use the sidebar to create your first event
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: MemoryEvent) => (
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
