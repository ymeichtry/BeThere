import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type AuthView = "login" | "signup";

const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Session check & redirect to "/" if logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/");
    });
    return () => {
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (view === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: name,
          },
        },
      });
      setLoading(false);
      if (error) toast({ title: "Fehler", description: error.message });
      else toast({ title: "Bestätigungs-E-Mail gesendet", description: "Bitte überprüfe dein Postfach." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) toast({ title: "Fehler", description: error.message });
      else navigate("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md border rounded-lg p-6 bg-white shadow-md">
        <h2 className="text-2xl font-bold mb-4">{view === "login" ? "Login" : "Registrieren"}</h2>
        <form onSubmit={handleAuth} className="flex flex-col gap-3">
          {view === "signup" && (
            <Input
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              type="text"
              required
              autoFocus
            />
          )}
          <Input
            placeholder="E-Mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            required
            autoFocus={view === "login"}
          />
          <Input
            placeholder="Passwort"
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Lädt..." : view === "login" ? "Login" : "Registrieren"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {view === "login" ? (
            <>
              Noch kein Account?{" "}
              <button
                className="underline text-blue-600"
                onClick={() => setView("signup")}
              >
                Registrieren
              </button>
            </>
          ) : (
            <>
              Schon einen Account?{" "}
              <button
                className="underline text-blue-600"
                onClick={() => setView("login")}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
