import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "./DashboardSidebar";
import CreateEventDialog from "./CreateEventDialog";
import { useEvents } from "@/hooks/useEvent";
import type { EventType } from "@/types/event";
import { cn } from "@/lib/utils";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createEvent } = useEvents();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleCreateEvent = (data: {
    name: string;
    type: EventType;
    customType?: string;
    coverImage?: string;
    eventDate?: string;
  }) => {
    createEvent(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        onCreateEvent={() => setIsCreateDialogOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main
        className={cn(
          "transition-all duration-300 p-8",
          isSidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <Outlet />
      </main>

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateEvent}
      />
    </div>
  );
};

export default DashboardLayout;
