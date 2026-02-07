import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/index"
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import DashboardEvents from "./pages/DashboardEvents";
import EventDetail from "./pages/EventDetails";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestUpload from "./pages/GuestUpload";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              } 
            >
              <Route index element={<DashboardHome />} />
              <Route path="events" element={<DashboardEvents />} />
              <Route path="event/:id" element={<EventDetail />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/event/:shareCode" element={<GuestUpload />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </TooltipProvider>
    </ThemeProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
