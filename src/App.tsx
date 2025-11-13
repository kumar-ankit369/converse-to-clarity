import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import ClerkLogin from "@/pages/ClerkLogin";
import ClerkRegister from "@/pages/ClerkRegister";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Teams from "@/pages/Teams";
import TeamDetail from "@/pages/TeamDetail";
import TeamSettings from "@/pages/TeamSettings";
import Chat from "@/pages/Chat";
import { ClerkProtectedRoute } from "@/components/ClerkProtectedRoute";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<ClerkLogin />} />
          <Route path="/register" element={<ClerkRegister />} />
          <Route 
            path="/dashboard" 
            element={
              <ClerkProtectedRoute>
                <Dashboard />
              </ClerkProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ClerkProtectedRoute>
                <Projects />
              </ClerkProtectedRoute>
            } 
          />
          <Route 
            path="/teams" 
            element={
              <ClerkProtectedRoute>
                <Teams />
              </ClerkProtectedRoute>
            } 
          />
          <Route 
            path="/teams/:teamId" 
            element={
              <ClerkProtectedRoute>
                <TeamDetail />
              </ClerkProtectedRoute>
            }
          />
          <Route 
            path="/teams/:teamId/settings" 
            element={
              <ClerkProtectedRoute>
                <TeamSettings />
              </ClerkProtectedRoute>
            }
          />
          <Route 
            path="/chat" 
            element={
              <ClerkProtectedRoute>
                <Chat />
              </ClerkProtectedRoute>
            } 
          />
          <Route 
            path="/chat/:channelId" 
            element={
              <ClerkProtectedRoute>
                <Chat />
              </ClerkProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
