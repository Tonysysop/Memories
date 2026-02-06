import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "./DashboardSidebar";
import CreateEventDialog from "./CreateEventDialog";
import { useEvents } from "@/hooks/useEvent";
import type { EventType } from "@/types/event";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createEvent } = useEvents();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/80 backdrop-blur-md z-[40] flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Menu className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">MEMORIES</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </Button>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar
          onCreateEvent={() => setIsCreateDialogOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-background border-r border-border z-[101] shadow-2xl lg:hidden"
            >
              <DashboardSidebar
                onCreateEvent={() => {
                  setIsCreateDialogOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                isCollapsed={false}
                onToggle={() => {}}
                isMobile
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main
        className={cn(
          "transition-all duration-300 p-6 md:p-8 pt-24 lg:pt-8",
          "ml-0", // Default mobile
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64" // Desktop padding
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
