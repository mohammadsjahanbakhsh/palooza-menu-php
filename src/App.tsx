import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import your page components
import Login from "./pages/Login"; 
import Register from './pages/Register';
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  // Logic to set dynamic colors from localStorage on app start
  useEffect(() => {
    const colorsString = localStorage.getItem('tableColors');
    if (colorsString) {
      try {
        const colors = JSON.parse(colorsString);
        const formatColor = (colorValue?: string) => {
          if (!colorValue) return '';
          const parts = colorValue.split(' ');
          if (parts.length === 3 && parts[1]?.includes('%')) return colorValue;
          return `rgb(${colorValue})`;
        };

        const colorMap = {
          '--table-free': colors.tableFree,
          '--table-reserved': colors.tableReserved,
          '--table-serving': colors.tableServing,
          '--table-paid': colors.tablePaid
        };

        for (const [variable, value] of Object.entries(colorMap)) {
          if (value) {
            document.documentElement.style.setProperty(variable, formatColor(value as string));
          }
        }
      } catch (error) {
        console.error("Failed to apply table colors:", error);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            {/* Redirect root path to the login page */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard"element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Catch-all route for any other path */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;