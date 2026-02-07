import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvent";
import { useNavigate, useOutletContext } from "react-router-dom";
import EventCard from "@/components/dashboard/EventCard";
import EmptyState from "@/components/ui/EmptyState";
import { Calendar, Image, Users } from "lucide-react";
import type { MemoryEvent } from "@/types/event";
import { useState } from "react"; // Added useState import
import DeleteEventDialog from "@/components/dashboard/DeleteEventDialog"; // Added import
import QuickShareDialog from "@/components/dashboard/QuickShareDialog";
import { Skeleton } from "@/components/ui/skeleton";

// Note: We might need to access the "open create dialog" from the layout if we want this button to work.
// For now, I'll temporarily hide the "New Event" button here or we can use an Outlet context.
// Actually, let's just show stats and recent events.

const DashboardHome = () => {
  const { user } = useAuth();
  const { events, isLoading: eventsLoading, updateEvent } = useEvents();
  const navigate = useNavigate();
  const { setIsCreateDialogOpen } = useOutletContext<{ setIsCreateDialogOpen: (open: boolean) => void }>();

  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const [shareDialog, setShareDialog] = useState<{ isOpen: boolean; event: { id: string, name: string, shareCode: string } | null }>({
    isOpen: false,
    event: null
  });

  const handleViewEvent = (event: MemoryEvent) => {
    navigate(`/dashboard/event/${event.id}`);
  };

  const handleDeleteEvent = (id: string) => {
    const event = events.find(e => e.id === id);
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
      event: { id: event.id, name: event.name, shareCode: event.shareCode }
    });
  };

  // Stats
  const totalEvents = events.length;
  const totalUploads = events.reduce((sum: number, e: MemoryEvent) => sum + e.uploads.length, 0);
  const activeEvents = events.filter((e: MemoryEvent) => !e.isLocked).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Welcome back, {user?.user_metadata?.name || 'User'}!</h1>
        <p className="text-muted-foreground mt-1">
          Manage your events and view collected memories
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEvents}</p>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Image className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalUploads}</p>
              <p className="text-sm text-muted-foreground">Total Memories</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeEvents}</p>
              <p className="text-sm text-muted-foreground">Active Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Events</h2>
          {/* TODO: Add 'View All' link if list is long */}
        </div>

        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState 
            title="No events yet" 
            description="Create your first event to start collecting memories with your friends and family."
            actionLabel="Create My First Event"
            onAction={() => setIsCreateDialogOpen(true)}
          />
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
      </div>

      <DeleteEventDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}
        eventId={deleteDialog.id}
        eventName={deleteDialog.name}
      />

      <QuickShareDialog
        isOpen={shareDialog.isOpen}
        onClose={() => setShareDialog(prev => ({ ...prev, isOpen: false }))}
        event={shareDialog.event}
      />
    </div>
  );
};

export default DashboardHome;
