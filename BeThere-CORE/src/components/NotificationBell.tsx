import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  read_at: string | null;
  created_at: string;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Fehler", description: error.message });
      } else {
        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.read_at).length || 0);
      }
    };

    fetchNotifications();

    // Realtime subscription
    const notificationChannel = supabase
      .channel(`public:notifications:user_id=eq.${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, payload => {
        fetchNotifications(); // Re-fetch all notifications on any change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Fehler", description: error.message });
    } else {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Fehler", description: error.message });
    } else {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => prev > 0 && notifications.find(n => n.id === id && !n.read_at) ? prev - 1 : prev);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>Benachrichtigungen</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-center text-gray-500">
            Keine Benachrichtigungen
          </DropdownMenuItem>
        ) : (
          <ScrollArea className="h-[300px] w-full rounded-md border">
            {notifications.map(notification => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-2 border-b last:border-b-0">
                <div className="flex justify-between w-full">
                  <span className={`font-medium ${notification.read_at ? "text-gray-500" : "text-black"}`}>
                    {notification.title}
                  </span>
                  <div className="flex gap-1">
                    {!notification.read_at && (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}>
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {notification.message && (
                  <p className={`text-sm ${notification.read_at ? "text-gray-400" : "text-gray-600"}`}>
                    {notification.message}
                  </p>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell; 