import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  Plus,
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardSidebarProps {
  onCreateEvent: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ onCreateEvent, isCollapsed, onToggle }: DashboardSidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'My Events', path: '/dashboard/events' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const SidebarButton = ({ item, isActive }: { item: typeof navItems[0], isActive: boolean }) => (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3",
        isCollapsed && "justify-center px-2"
      )}
      onClick={() => navigate(item.path)}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
    </Button>
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col transition-all duration-300 z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className={cn("flex items-center gap-2", isCollapsed && "justify-center w-full")}>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          {!isCollapsed && (
            <span className="font-display text-xl font-semibold tracking-tight">
              MEMORIES
            </span>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="absolute -right-3 top-20">
        <Button
          variant="secondary"
          size="icon"
          className="w-6 h-6 rounded-full shadow-md border border-border"
          onClick={onToggle}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Create Event Button */}
      <div className="p-4">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onCreateEvent} size="icon" className="w-full aspect-square">
                  <Plus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Create Event</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button onClick={onCreateEvent} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname === '/dashboard');

            return (
              <li key={item.path}>
                {isCollapsed ? (
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div>
                          <SidebarButton item={item} isActive={isActive} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <SidebarButton item={item} isActive={isActive} />
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className={cn("flex items-center gap-3 mb-4", isCollapsed ? "justify-center flex-col" : "px-2")}>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-primary">
              {user?.user_metadata?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.user_metadata?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <ThemeToggle />
        </div>

        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-center text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
