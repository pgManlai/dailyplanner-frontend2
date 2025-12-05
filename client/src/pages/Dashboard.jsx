import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { QuickActions } from "@/components/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon, 
  Target,
  Clock,
  ChevronRight,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { format, isToday, isTomorrow, startOfDay } from "date-fns";
import { Link } from "wouter";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { FocusModeDialog } from "@/components/FocusModeDialog";

import api from "@/lib/helper";
import { normalizeTask } from "@/lib/enum";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Өглөөний мэнд";
  if (hour < 17) return "Өдрийн мэнд";
  return "Оройн мэнд";
}

function getPriorityColor(priority) {
  switch (priority) {
    case "high": return "bg-destructive/10 text-destructive border-destructive/20";
    case "medium": return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    case "low": return "bg-primary/10 text-primary border-primary/20";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function Dashboard() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [goals, setGoals] = useState([]);

  const [tasksLoading, setTasksLoading] = useState(true);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [addGoalOpen, setAddGoalOpen] = useState(false);

  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalUnit, setGoalUnit] = useState("");
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalItems, setGoalItems] = useState([]); // checklist items when creating
  const [newItemTitle, setNewItemTitle] = useState("");

  // Goal detail modal
  const [goalDetailOpen, setGoalDetailOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [detailNewItemTitle, setDetailNewItemTitle] = useState("");

  const loadAllData = async () => {
    try {
      setTasksLoading(true);
      setGoalsLoading(true);

      const [taskResRaw, goalRes] = await Promise.all([
        api.get("/task/get-tasks"),
        api.get("/goals"),
      ]);

      // Normalize task status/priority from backend enums
      const taskRes = Array.isArray(taskResRaw)
        ? taskResRaw.map(normalizeTask)
        : [];

      setTasks(taskRes);
      setMeetings([]); // meetings одоохондоо ашиглахгүй
      setGoals(goalRes);
      
      // Debug: Check tasks data
      console.log("[Dashboard] Loaded tasks:", taskRes.length);
      console.log("[Dashboard] Tasks with dueDate:", taskRes.filter(t => t.dueDate).length);
      console.log("[Dashboard] Sample tasks:", taskRes.slice(0, 3).map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        status: t.status
      })));

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setTasksLoading(false);
      setGoalsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Today section: include tasks with today's due date OR no due date at all
  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return true; // No due date = show in today
    try {
      const taskDate = new Date(t.dueDate);
      const today = startOfDay(new Date());
      const taskDateStart = startOfDay(taskDate);
      const isTodayTask = taskDateStart.getTime() === today.getTime();
      return isTodayTask;
    } catch (e) {
      console.error("Error parsing dueDate:", t.dueDate, e);
      return false;
    }
  });
  
  // Debug: Log today tasks
  console.log("[Dashboard] Today tasks count:", todayTasks.length);
  console.log("[Dashboard] Today tasks:", todayTasks.map(t => ({
    id: t.id,
    title: t.title,
    dueDate: t.dueDate,
    status: t.status
  })));
  const pendingTasks = todayTasks.filter(t => t.status !== "done");
  const completedTasks = todayTasks.filter(t => t.status === "done");
  const completionRate = todayTasks.length
    ? Math.round((completedTasks.length / todayTasks.length) * 100)
    : 0;

  const upcomingMeetings = meetings
    .filter(m => new Date(m.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 3);

  const firstName = user?.firstName || user?.email?.split("@")[0] || "there";

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTarget || !goalUnit.trim()) return;

    setGoalSaving(true);
    try {
      const newGoal = await api.send("/goals", {
        title: goalTitle.trim(),
        description: goalDescription.trim() || null,
        targetValue: Number(goalTarget),
        unit: goalUnit.trim(),
      });

      // If checklist items exist, create them
      if (goalItems.length > 0 && newGoal.goal?.id) {
        await Promise.all(
          goalItems.map((item) =>
            api.send(`/goals/${newGoal.goal.id}/items`, { title: item.title })
          )
        );
      }

      setGoalTitle("");
      setGoalDescription("");
      setGoalTarget("");
      setGoalUnit("");
      setGoalItems([]);
      setNewItemTitle("");
      setAddGoalOpen(false);
      await loadAllData();
    } catch (err) {
      console.error("Failed to create goal:", err);
    } finally {
      setGoalSaving(false);
    }
  };

  const handleAddItemToNewGoal = () => {
    if (!newItemTitle.trim()) return;
    setGoalItems([...goalItems, { id: Date.now(), title: newItemTitle.trim() }]);
    setNewItemTitle("");
  };

  const handleRemoveItemFromNew = (id) => {
    setGoalItems(goalItems.filter((i) => i.id !== id));
  };

  const openGoalDetail = (goal) => {
    setSelectedGoal(goal);
    setGoalDetailOpen(true);
  };

  const handleToggleGoalItem = async (itemId) => {
    if (!selectedGoal) return;
    
    // Optimistic update - шууд UI-г шинэчлэх
    const item = selectedGoal.items?.find((i) => i.id === itemId);
    if (item) {
      const updatedItems = selectedGoal.items.map((i) =>
        i.id === itemId ? { ...i, done: !i.done } : i
      );
      setSelectedGoal({ ...selectedGoal, items: updatedItems });
    }
    
    try {
      await api.update(`/goals/items/${itemId}`, {});
      // Reload to get updated items from server
      await loadAllData();
      // Update selected goal in state with fresh data
      const updated = goals.find((g) => g.id === selectedGoal.id);
      if (updated) setSelectedGoal(updated);
    } catch (err) {
      console.error("Failed to toggle goal item:", err);
      // Revert optimistic update on error
      if (item) {
        const revertedItems = selectedGoal.items.map((i) =>
          i.id === itemId ? { ...i, done: item.done } : i
        );
        setSelectedGoal({ ...selectedGoal, items: revertedItems });
      }
    }
  };

  const handleAddItemToGoal = async () => {
    if (!detailNewItemTitle.trim() || !selectedGoal) return;
    try {
      await api.send(`/goals/${selectedGoal.id}/items`, {
        title: detailNewItemTitle.trim(),
      });
      setDetailNewItemTitle("");
      await loadAllData();
      const updated = goals.find((g) => g.id === selectedGoal.id);
      if (updated) setSelectedGoal(updated);
    } catch (err) {
      console.error("Failed to add item:", err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), "EEEE, MMMM d")} — Өнөөдрөө төлөвлөе
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFocusModeOpen(true)}>
              <Clock className="w-4 h-4 mr-2" />
              Төвлөрөх горим
            </Button>

            <Button onClick={() => setAddTaskOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Даалгавар нэмэх
            </Button>
          </div>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card>
              <CardHeader className="flex justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Өнөөдрийн даалгавар
                </CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Бүгдийг харах
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>

              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : todayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Өнөөдөр даалгавар алга</p>
                    <Button variant="link" onClick={() => setAddTaskOpen(true)}>
                      Эхний даалгавраа нэмэх
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <span>{completedTasks.length} of {todayTasks.length} completed</span>
                      <span>{completionRate}%</span>
                    </div>

                    <Progress value={completionRate} className="h-2 mb-4" />

                    {pendingTasks.slice(0, 4).map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                        <div className="flex-1">
                          <p className="font-medium truncate">{task.title}</p>
                        </div>

                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </motion.div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* GOALS */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-chart-3" />
                  Зорилгуудын явц
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddGoalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Зорилго нэмэх
                </Button>
              </CardHeader>

              <CardContent>
                {goalsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : goals.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">Одоогоор зорилго бүртгэгдээгүй байна</p>
                  </div>
                ) : (
                  goals.slice(0, 3).map(goal => {
                    const hasItems = Array.isArray(goal.items) && goal.items.length > 0;
                    const completedItems = hasItems
                      ? goal.items.filter((i) => i.done).length
                      : 0;
                    const rawProgress = hasItems
                      ? (completedItems / goal.items.length) * 100
                      : (goal.currentValue / goal.targetValue) * 100;
                    const progress = Math.min(100, Math.round(rawProgress));
                    const isCompleted = rawProgress >= 100;

                    return (
                      <div
                        key={goal.id}
                        className="space-y-2 cursor-pointer hover:bg-muted/30 p-2 rounded-lg transition-colors"
                        onClick={() => openGoalDetail(goal)}
                      >
                        <div className="flex justify-between items-center text-sm">
                          <span className={isCompleted ? "font-semibold text-emerald-600" : ""}>
                            {goal.title}
                          </span>
                          <span className="flex items-center gap-2">
                            {isCompleted && (
                              <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                                Хүрсэн
                              </Badge>
                            )}
                            <span>
                              {hasItems
                                ? `${completedItems}/${goal.items.length} алхам`
                                : `${goal.currentValue}/${goal.targetValue} ${goal.unit}`}
                            </span>
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className={`h-2 ${isCompleted ? "bg-emerald-100" : ""}`}
                        />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <QuickActions 
        onAddTask={() => setAddTaskOpen(true)} 
        onStartFocus={() => setFocusModeOpen(true)} 
      />

      <AddTaskDialog open={addTaskOpen} onOpenChange={setAddTaskOpen} refresh={loadAllData} />
      <FocusModeDialog open={focusModeOpen} onOpenChange={setFocusModeOpen} />

      <Dialog open={addGoalOpen} onOpenChange={setAddGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Зорилго үүсгэх</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Гарчиг</label>
              <Input
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="Жишээ нь: 10 ном унших"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Тайлбар (заавал биш)</label>
              <Textarea
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder="Жишээ нь: энэ жил 10 ном уншиж дуусгах"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Зорилтот тоо</label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Нэгж</label>
                <Input
                  value={goalUnit}
                  onChange={(e) => setGoalUnit(e.target.value)}
                  placeholder="ном, цаг, км..."
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Checklist (заавал биш)</label>
              <div className="flex gap-2">
                <Input
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Алхмын нэр..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddItemToNewGoal();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItemToNewGoal}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {goalItems.length > 0 && (
                <div className="space-y-1 mt-2">
                  {goalItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm"
                    >
                      <span>{item.title}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItemFromNew(item.id)}
                      >
                        <span className="text-destructive">×</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddGoalOpen(false)}
              >
                Болих
              </Button>
              <Button
                type="submit"
                disabled={
                  goalSaving ||
                  !goalTitle.trim() ||
                  !goalTarget ||
                  !goalUnit.trim()
                }
              >
                {goalSaving ? "Хадгалж байна..." : "Зорилго хадгалах"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Goal Detail Modal */}
      <Dialog open={goalDetailOpen} onOpenChange={setGoalDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedGoal?.title}</DialogTitle>
          </DialogHeader>

          {selectedGoal && (
            <div className="space-y-4">
              {selectedGoal.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedGoal.description}
                </p>
              )}

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Явц</span>
                  <span>
                    {Array.isArray(selectedGoal.items) && selectedGoal.items.length > 0
                      ? `${selectedGoal.items.filter((i) => i.done).length}/${selectedGoal.items.length} алхам`
                      : `${selectedGoal.currentValue}/${selectedGoal.targetValue} ${selectedGoal.unit}`}
                  </span>
                </div>
                <Progress
                  value={
                    Array.isArray(selectedGoal.items) && selectedGoal.items.length > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (selectedGoal.items.filter((i) => i.done).length /
                              selectedGoal.items.length) *
                              100
                          )
                        )
                      : Math.min(
                          100,
                          Math.round(
                            (selectedGoal.currentValue / selectedGoal.targetValue) * 100
                          )
                        )
                  }
                  className="h-2"
                />
              </div>

              {/* Checklist */}
              {Array.isArray(selectedGoal.items) && selectedGoal.items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Checklist</p>
                  <div className="space-y-1">
                    {selectedGoal.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 cursor-pointer"
                        onClick={() => handleToggleGoalItem(item.id)}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            item.done
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {item.done && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            item.done ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new item */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Шинэ алхам нэмэх</p>
                <div className="flex gap-2">
                  <Input
                    value={detailNewItemTitle}
                    onChange={(e) => setDetailNewItemTitle(e.target.value)}
                    placeholder="Алхмын нэр..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddItemToGoal();
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddItemToGoal}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalDetailOpen(false)}>
              Хаах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
