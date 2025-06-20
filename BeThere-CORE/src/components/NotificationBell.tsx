import React, { useState, useEffect } from "react";
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

// Notification-Helpers für LocalStorage
const NOTIFICATIONS_KEY = 'local_notifications';
function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveNotifications(notifications: Notification[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

const NotificationBell: React.FC & { addNotification?: (n: Omit<Notification, 'id' | 'created_at'>) => void } = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loaded = loadNotifications();
    setNotifications(loaded);
    setUnreadCount(loaded.filter(n => !n.read_at).length);
  }, []);

  // Helper zum Hinzufügen (kann von außen importiert werden)
  NotificationBell.addNotification = (notification: Omit<Notification, 'id' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      saveNotifications(updated);
      setUnreadCount(updated.filter(n => !n.read_at).length);
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n);
      saveNotifications(updated);
      setUnreadCount(updated.filter(n => !n.read_at).length);
      return updated;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveNotifications(updated);
      setUnreadCount(updated.filter(n => !n.read_at).length);
      return updated;
    });
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