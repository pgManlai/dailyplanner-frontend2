import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/helper";
import { normalizeTask } from "@/lib/enum";
import { Layout } from "@/components/Layout";
import { QuickActions } from "@/components/QuickActions";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { FocusModeDialog } from "@/components/FocusModeDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  setHours,
  setMinutes,
} from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setTasksLoading(true);
        const res = await api.get("/task/get-tasks");
        const normalized = Array.isArray(res)
          ? res.map(normalizeTask)
          : [];
        setTasks(normalized);
      } catch (err) {
        console.error("Calendar tasks load error:", err);
      } finally {
        setTasksLoading(false);
      }
    };

    loadTasks();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day) => {
    return tasks.filter(
      (t) => t.dueDate && isSameDay(new Date(t.dueDate), day)
    );
  };

  const selectedDayTasks = getTasksForDay(selectedDate);

  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Календарь</h1>
            <p className="text-muted-foreground mt-1">
              Өдрүүдийнхээ даалгаврыг календарь дээрээс хараарай
            </p>
          </div>
          <Button onClick={() => setAddTaskOpen(true)} data-testid="button-add-task">
            <Plus className="w-4 h-4 mr-2" />
            Даалгавар нэмэх
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 overflow-visible">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-semibold min-w-[200px] text-center">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(new Date());
                }}
                data-testid="button-today"
              >
                Өнөөдөр
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
                {calendarDays.map((day) => {
                  const dayTasks = getTasksForDay(day);
                  const hasEvents = dayTasks.length > 0;
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative p-2 min-h-[80px] rounded-lg text-left transition-colors
                        ${isSelected ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted/50"}
                        ${!isCurrentMonth ? "opacity-40" : ""}
                        ${isToday(day) ? "font-bold" : ""}
                      `}
                      data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                    >
                      <span
                        className={`
                          inline-flex items-center justify-center w-7 h-7 rounded-full text-sm
                          ${isToday(day) ? "bg-primary text-primary-foreground" : ""}
                        `}
                      >
                        {format(day, "d")}
                      </span>
                      {hasEvents && (
                        <div className="mt-1 space-y-1">
                            <div className="text-xs px-1.5 py-0.5 rounded bg-muted truncate">
                            {dayTasks.length} даалгавар
                            </div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">
                {format(selectedDate, "yyyy-MM-dd")} — тухайн өдрийн даалгавар
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : selectedDayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Энэ өдөрт даалгавар төлөвлөөгүй байна
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddTaskOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Даалгавар нэмэх
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayTasks.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Тухайн өдрийн даалгавар
                      </p>
                      {selectedDayTasks.map((task) => (
                        <Link key={task.id} href="/tasks">
                          <a
                            className="block p-2 rounded-lg bg-muted/30 text-sm hover:bg-muted cursor-pointer"
                          data-testid={`task-detail-${task.id}`}
                        >
                          {task.title}
                          </a>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <QuickActions
        onAddTask={() => setAddTaskOpen(true)}
        onStartFocus={() => setFocusModeOpen(true)}
      />

      <AddTaskDialog
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        defaultDate={selectedDate}
      />
      <FocusModeDialog
        open={focusModeOpen}
        onOpenChange={(open) => {
          if (!open && typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification("Төвлөрөх горим дууслаа", {
                body: "Сайн ажиллалаа! Одоо богинохон амарчих.",
              });
            } else {
              toast({
                title: "Төвлөрөх горим дууслаа",
                description: "Сайн ажиллалаа! Одоо богинохон амарчих.",
              });
            }
          }
          setFocusModeOpen(open);
        }}
      />
    </Layout>
  );
}
