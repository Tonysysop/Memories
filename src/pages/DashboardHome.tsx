import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useEvent";
import { useNavigate, useOutletContext } from "react-router-dom";
import EventList from "@/components/dashboard/EventList";
import FeaturedEventHero from "@/components/dashboard/FeaturedEventHero";
import RecentMediaFeed from "@/components/dashboard/RecentMediaFeed";
import EmptyState from "@/components/ui/EmptyState";
import type { MemoryEvent } from "@/types/event";
import { useState, useMemo } from "react";
import DeleteEventDialog from "@/components/dashboard/DeleteEventDialog";
import QuickShareDialog from "@/components/dashboard/QuickShareDialog";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardHome = () => {
  const { user } = useAuth();
  const { events, isLoading: eventsLoading, updateEvent } = useEvents();
  const navigate = useNavigate();
  const { setIsCreateDialogOpen } = useOutletContext<{
    setIsCreateDialogOpen: (open: boolean) => void;
  }>();

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

  // Logic to determine featured event (next upcoming or most recent)
  const featuredEvent = useMemo(() => {
    if (events.length === 0) return null;

    const now = new Date();
    const upcoming = events
      .filter((e) => e.eventDate && new Date(e.eventDate) >= now && !e.isLocked)
      .sort(
        (a, b) =>
          new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime(),
      );

    if (upcoming.length > 0) return upcoming[0];

    return events
      .filter((e) => !e.isLocked)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
  }, [events]);

  // Stats
  const totalEvents = events.length;
  const totalUploads = events.reduce(
    (sum: number, e: MemoryEvent) =>
      sum +
      e.uploads.filter((u) => u.type === "photo" || u.type === "video").length,
    0,
  );
  const totalGifts = events.reduce(
    (sum: number, e: MemoryEvent) =>
      sum + e.uploads.filter((u) => u.type === "gift").length,
    0,
  );
  const activeEvents = events.filter((e: MemoryEvent) => !e.isLocked).length;

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Welcome back, {user?.user_metadata?.name || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your events and view collected memories
          </p>
        </div>

        {/* Quick Stats Integrated in Header */}
        <div className="flex items-center gap-8 bg-card/30 backdrop-blur-sm border border-border/40 p-1.5 pr-6 rounded-2xl">
          <div className="flex -space-x-3 overflow-hidden p-1">
            {events.slice(0, 3).map((e) => (
              <div
                key={e.id}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-background overflow-hidden bg-muted"
              >
                {e.coverImage ? (
                  <img
                    src={e.coverImage}
                    className="h-full w-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="h-full w-full bg-primary/20" />
                )}
              </div>
            ))}
            {totalEvents > 3 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold ring-2 ring-background">
                +{totalEvents - 3}
              </div>
            )}
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">
                Uploads
              </p>
              <p className="text-sm font-bold">{totalUploads}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">
                Gifts
              </p>
              <p className="text-sm font-bold">{totalGifts}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">
                Active
              </p>
              <p className="text-sm font-bold">{activeEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {eventsLoading ? (
        <div className="space-y-10">
          <Skeleton className="h-[400px] w-full rounded-3xl" />
          <Skeleton className="h-[200px] w-full rounded-3xl" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Create your first event to start collecting memories with your friends and family."
          actionLabel="Create My First Event"
          onAction={() => setIsCreateDialogOpen(true)}
        />
      ) : (
        <>
          {featuredEvent && (
            <FeaturedEventHero
              event={featuredEvent}
              onView={handleViewEvent}
              onShare={handleShareEvent}
            />
          )}

          <RecentMediaFeed events={events} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Event Library</h2>
              <p className="text-xs text-muted-foreground font-medium">
                {totalEvents} events total
              </p>
            </div>
            <EventList
              events={events}
              onView={handleViewEvent}
              onDelete={handleDeleteEvent}
              onToggleLock={handleToggleLock}
              onShare={handleShareEvent}
            />
          </div>
        </>
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

export default DashboardHome;
