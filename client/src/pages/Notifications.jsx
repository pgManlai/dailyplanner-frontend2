import { Layout } from "@/components/Layout";
import { QuickActions } from "@/components/QuickActions";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { FocusModeDialog } from "@/components/FocusModeDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Trash2,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/helper";

const notificationIcons = {
  task: CheckCircle2,
  meeting: Calendar,
  system: Bell,
  chat: MessageCircle,
};

const notificationColors = {
  task: "text-primary bg-primary/10",
  meeting: "text-chart-2 bg-chart-2/10",
  system: "text-chart-4 bg-chart-4/10",
  chat: "text-chart-3 bg-chart-3/10",
};

function NotificationItem({ notification, onMarkRead, onDelete }) {
  const Icon = notificationIcons[notification.type] || Bell;
  const colorClass = notificationColors[notification.type] || "text-muted-foreground bg-muted";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group flex items-start gap-4 p-4 rounded-xl transition-colors hover-elevate ${
        notification.isRead ? "bg-muted/30" : "bg-card border border-card-border"
      }`}
      data-testid={`notification-${notification.id}`}
    >
      {!notification.isRead && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
      )}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${notification.isRead ? "text-muted-foreground" : ""}`}>
              {notification.title}
            </p>
            {notification.message && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onMarkRead(notification.id)}
                data-testid={`button-mark-read-${notification.id}`}
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(notification.id)}
              data-testid={`button-delete-${notification.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Notifications() {
  console.log("[Frontend] Notifications component mounted");
  const { toast } = useToast();
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      console.log("[Frontend] Fetching notifications...");
      const data = await api.get("/notifications");
      console.log("[Frontend] Received notifications:", data);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[Frontend] Failed to load notifications:", err);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.update(`/notifications/${id}`, { isRead: true });
      await loadNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.senddelete(`/notifications/${id}`);
      toast({
        title: "Устгалаа",
        description: "Мэдэгдэл устгагдлаа.",
      });
      await loadNotifications();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.send("/notifications/mark-all-read", {});
      toast({
        title: "Бүгдийг уншсан",
      });
      await loadNotifications();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  
  console.log("[Frontend] Notifications state:", notifications);
  console.log("[Frontend] Unread count:", unreadCount);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
              Мэдэгдэл
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount} шинэ
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Даалгавар болон сануулгын талаарх мэдээлэл
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                data-testid="button-mark-all-read"
              >
                <Check className="w-4 h-4 mr-2" />
                Бүгдийг уншсан
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="overflow-visible">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Мэдэгдэл алга</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Та бүх зүйлээ хийж дууссан байна! Даалгавар болон сануулгын шинэ мэдэгдэл энд харагдана.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <QuickActions
        onAddTask={() => setAddTaskOpen(true)}
        onStartFocus={() => setFocusModeOpen(true)}
      />

      <AddTaskDialog open={addTaskOpen} onOpenChange={setAddTaskOpen} />
      <FocusModeDialog open={focusModeOpen} onOpenChange={setFocusModeOpen} />
    </Layout>
  );
}
