import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import NotificationBell from "./components/NotificationBell";
import HeaderProfileAvatar from "./components/HeaderProfileAvatar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import ProfilePage from "./pages/Profile";
import CreatePartyPage from "./pages/CreateParty";
import Parties from "./pages/Parties";
import PartyDetails from "./pages/PartyDetails";
import MyParties from "./pages/MyParties";
import MyAttendance from "./pages/MyAttendance";
import MapPage from "./pages/MapPage";
import { useState } from "react";
import { Menu } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <nav className="w-full shadow sticky top-0 z-20 bg-white border-b">
            <div className="container flex items-center justify-between py-2">
              <div className="flex items-center gap-4">
                <Link className="text-xl font-bold" to="/">BeThere</Link>
                <div className="hidden md:flex items-center gap-4">
                  <Link to="/parties" className="hover:underline">Alle Partys</Link>
                  <Link to="/my-parties" className="hover:underline">Meine Partys</Link>
                  <Link to="/my-attendance" className="hover:underline">Meine Anmeldungen</Link>
                  <Link to="/create-party" className="hover:underline">Party erstellen</Link>
                  <Link to="/map" className="hover:underline">Karte</Link>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="md:hidden p-2" onClick={() => setNavOpen(v => !v)} aria-label="Menü öffnen">
                  <Menu className="w-6 h-6" />
                </button>
                <HeaderProfileAvatar />
                <NotificationBell />
              </div>
            </div>
            {/* Mobile Nav */}
            {navOpen && (
              <div className="md:hidden bg-white border-t shadow px-4 py-2 flex flex-col gap-2 animate-fade-in-down">
                <Link to="/parties" className="py-2" onClick={() => setNavOpen(false)}>Alle Partys</Link>
                <Link to="/my-parties" className="py-2" onClick={() => setNavOpen(false)}>Meine Partys</Link>
                <Link to="/my-attendance" className="py-2" onClick={() => setNavOpen(false)}>Meine Anmeldungen</Link>
                <Link to="/create-party" className="py-2" onClick={() => setNavOpen(false)}>Party erstellen</Link>
                <Link to="/map" className="py-2" onClick={() => setNavOpen(false)}>Karte</Link>
              </div>
            )}
          </nav>
          <Routes>
            <Route path="/" element={<Navigate to="/parties" />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create-party" element={<CreatePartyPage />} />
            <Route path="/parties" element={<Parties />} />
            <Route path="/my-parties" element={<MyParties />} />
            <Route path="/my-attendance" element={<MyAttendance />} />
            <Route path="/party/:id" element={<PartyDetails />} />
            <Route path="/map" element={<MapPage />} />
            {/* CATCH ALL */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
