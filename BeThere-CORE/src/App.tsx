
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import ProfilePage from "./pages/Profile";
import CreatePartyPage from "./pages/CreateParty";
import Parties from "./pages/Parties";
import PartyDetails from "./pages/PartyDetails";
import MyParties from "./pages/MyParties";
import MyAttendance from "./pages/MyAttendance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <nav className="w-full shadow sticky top-0 z-20 bg-white border-b">
          <div className="container flex items-center gap-4 py-2">
            <Link className="text-xl font-bold" to="/">BeThere</Link>
            <Link to="/parties" className="hover:underline">Alle Partys</Link>
            <Link to="/my-parties" className="hover:underline">Meine Partys</Link>
            <Link to="/my-attendance" className="hover:underline">Meine Anmeldungen</Link>
            <Link to="/create-party" className="hover:underline">Party erstellen</Link>
            <Link to="/profile" className="ml-auto hover:underline">Profil</Link>
          </div>
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
          {/* CATCH ALL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
