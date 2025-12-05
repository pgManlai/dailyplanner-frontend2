import { useState, useEffect } from "react";
import api from "@/lib/helper";
import { normalizeTask, statusMap } from "@/lib/enum";
import { Layout } from "@/components/Layout";
import { QuickActions } from "@/components/QuickActions";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { FocusModeDialog } from "@/components/FocusModeDialog";
import { DndContext, DragOverlay, closestCenter, pointerWithin, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Шинээр нэмэх импортнууд:
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

import {
  List,
  LayoutGrid,
  MoreHorizontal,
  Trash2,
  Edit,
  Plus,
  Calendar,
  Flag,
  Save,
  Calendar as CalendarIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isTomorrow, isPast, startOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";

function TaskDetailDialog({ open, onOpenChange, task, refresh, onToggle }) {
  const [status, setStatus] = useState(task?.status || "todo");
  const [category, setCategory] = useState(task?.category || "work");
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate) : null
  );

  useEffect(() => {
    if (task) {
      setStatus(task.status || "todo");
      setCategory(task.category || "work");
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  }, [task]);

  const saveChanges = async () => {
    if (!title.trim()) {
      // Гарчиг шаардлагатай
      return;
    }

    try {
      await api.update(`/task/${task.id}`, {
        status,
        category,
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate ? dueDate.toISOString() : null,
      });
      refresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={status === "done"}
              onCheckedChange={() => {
                if (onToggle && task) {
                  onToggle(task);
                  // Status-ийг шууд update хийх
                  const newStatus = status === "done" ? "todo" : "done";
                  setStatus(newStatus);
                }
              }}
              className="h-5 w-5"
            />
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">Ажлыг засах</DialogTitle>
              <DialogDescription>
                Ажлын мэдээллийг өөрчил
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">
              Гарчиг
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ажлын гарчиг оруулна уу"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Тайлбар
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ажлын дэлгэрэнгүй тайлбар оруулна уу"
              className="w-full min-h-[100px] border rounded-md p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 тэмдэгт
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Статус */}
            <div className="space-y-2">
              <Label htmlFor="status" className="font-medium">
                Статус
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="h-10">
                  <SelectValue placeholder="Статус сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      <span>Хийгдээгүй</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="inProgress">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Хийгдэж байгаа</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="done">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Дууссан</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ангилал */}
            <div className="space-y-2">
              <Label htmlFor="category" className="font-medium">
                Ангилал
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="h-10">
                  <SelectValue placeholder="Ангилал сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Ажил</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="personal">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Хувийн</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="health">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Эрүүл мэнд</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="learning">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span>Сургалт</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      <span>Бусад</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Дуусах хугацаа, Чухал байдал хамт */}
          <div className="grid grid-cols-2 gap-4">
            {/* Дуусах хугацаа */}
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="font-medium">
                Дуусах хугацаа <span className="text-muted-foreground font-normal text-xs">(заавал биш)</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, "yyyy-MM-dd")
                    ) : (
                      <span>Огноо сонгох</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Чухал байдал */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="font-medium">
                Чухал байдал
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority" className="h-10">
                  <SelectValue placeholder="Чухал байдал сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-green-500" />
                      <span>Бага</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-yellow-500" />
                      <span>Дунд</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-red-500" />
                      <span>Өндөр</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Цуцлах
          </Button>
          <Button 
            onClick={saveChanges}
            disabled={!title.trim()}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Хадгалах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ... үлдсэн код нь өмнөхтэй адил ...

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  low: "bg-primary/10 text-primary border-primary/20",
};

const categoryColors = {
  work: "bg-chart-1",
  personal: "bg-chart-2",
  health: "bg-chart-3",
  learning: "bg-chart-4",
  other: "bg-chart-5",
};

const statusColumns = {
  todo: { label: "Хийгдээгүй", color: "bg-muted" },
  inProgress: { label: "Хийгдэж байгаа", color: "bg-chart-4" },
  done: { label: "Дууссан", color: "bg-primary" },
};

// Droppable Column Component
function DroppableColumn({ id, title, tasks, onToggle, onDelete, onOpenDetail, bgColor }) {
  const { setNodeRef, isOver } = useDroppable({ 
    id,
    data: {
      type: 'column',
      status: id === "expired" ? null : id, // Expired нь status биш
      isExpiredColumn: id === "expired",
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[280px] flex-1 p-4 rounded-lg border-2 border-dashed transition-all ${
        isOver ? 'border-primary bg-primary/10 scale-[1.02]' : `border-muted-foreground/20 ${bgColor}`
      }`}
      data-column-id={id}
      data-droppable-column={id}
    >
      <h3 className="font-medium mb-3">
        {title} ({tasks.length})
      </h3>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[200px]">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onOpenDetail={onOpenDetail}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center min-h-[150px] border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Энд task чирж оруулна уу
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete, onOpenDetail, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCardDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task: task,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCardDragging ? 0.5 : 1,
  };

  const isOverdue =
    task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "done";

  const dueDateLabel = task.dueDate
    ? isToday(new Date(task.dueDate))
      ? "Өнөөдөр"
      : isTomorrow(new Date(task.dueDate))
        ? "Маргааш"
        : format(new Date(task.dueDate), "MMM d")
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group p-4 rounded-xl bg-card border hover-elevate cursor-grab active:cursor-grabbing mb-3"
      onClick={() => onOpenDetail(task)} 
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.status === "done"}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={() => onToggle(task)}
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
      {/* Гарчиг */}
      <div className="flex items-center gap-2">
        <p 
          className={`font-medium truncate ${
            task.status === "done" 
              ? "line-through text-muted-foreground" 
              : "text-foreground"
          }`}
        >
          {task.title}
        </p>
      </div>
      
              {/* Тайлбар */}
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>
            
            {/* Тохиргооны цэс */}
            <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
          <span className="sr-only">Тохиргоо</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => onOpenDetail(task)}
        >
          <Edit className="w-4 h-4" /> 
          Засах
        </DropdownMenuItem>
        
        <DropdownMenuSeparator/>
        
        <DropdownMenuItem
          className="gap-2 text-destructive cursor-pointer focus:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="w-4 h-4" /> 
          Устгах
        </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
    <Badge 
      variant="outline" 
      className={`gap-1.5 font-normal ${priorityColors[task.priority]}`}
    >
      <Flag className="w-3 h-3" />
      <span className="capitalize">{task.priority}</span>
    </Badge>

    {task.category && (
      <Badge variant="secondary" className="gap-1.5 font-normal">
        <div 
          className={`w-2 h-2 rounded-full ${categoryColors[task.category]}`} 
        />
        <span className="capitalize">{task.category}</span>
      </Badge>
    )}

    {dueDateLabel && (
      <Badge 
        variant="outline" 
        className={`gap-1.5 font-normal ${
          isOverdue ? "border-destructive/30 text-destructive" : ""
        }`}
      >
        <Calendar className="w-3 h-3" />
        {dueDateLabel}
      </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("list");
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [focusModeOpen, setFocusModeOpen] = useState(false);

  const { toast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // Нэг хуудсанд 10 task

  // Drag & Drop state
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px хөдөлсний дараа drag эхлэнэ
      },
    })
  );

  const openDetail = (task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/task/get-tasks");
      const normalizedTasks = res.map(normalizeTask);
      console.log("[Load Tasks] Loaded tasks:", normalizedTasks.length);
      console.log("[Load Tasks] Tasks by status:", {
        todo: normalizedTasks.filter(t => t.status === "todo").length,
        inProgress: normalizedTasks.filter(t => t.status === "inProgress").length,
        done: normalizedTasks.filter(t => t.status === "done").length,
      });
      setTasks(normalizedTasks);
    } catch (error) {
      console.error("[Load Tasks] Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const toggleTask = async (task) => {
    const newFrontendStatus = task.status === "done" ? "todo" : "done";
    await api.put(`/task/${task.id}`, {
      status: statusMap[newFrontendStatus],
    });
    loadTasks();
  };

  const deleteTask = async (taskId) => {
    await api.senddelete(`/task/${taskId}`);
    toast({ title: "Даалгавар устгагдлаа" });
    // Хэрэв устгаж буй task нь одоо сонгогдсон task байвал detail dialog-ийг хаах
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(null);
      setDetailOpen(false);
    }
    loadTasks();
  };

  // Drag & Drop handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      console.log("Drag cancelled - no over target");
      return;
    }

    // Task олох
    const task = tasks.find((t) => t.id === active.id);
    if (!task) {
      console.log("Task not found:", active.id);
      return;
    }

    console.log("Drag end event:", {
      activeId: active.id,
      overId: over.id,
      overData: over.data?.current,
      taskStatus: task.status,
    });

    // Шинэ status тодорхойлох - column ID-г олох
    let newStatus = null;
    
    // 1. Column data-аас олох
    if (over.data?.current?.type === 'column') {
      // Expired column-д тавьсан бол status өөрчлөхгүй
      if (over.data.current.isExpiredColumn) {
        console.log("⚠️ Dropped on expired column - status will not change");
        return;
      }
      newStatus = over.data.current.status;
      console.log("✅ Found column from data:", newStatus);
    } 
    // 2. over.id нь column ID эсэхийг шалгах
    else if (over.id === "todo" || over.id === "inProgress" || over.id === "done" || over.id === "expired") {
      // Expired column-д тавьсан бол status өөрчлөхгүй (expired нь status биш, зөвхөн due date нөхцөл)
      if (over.id === "expired") {
        console.log("⚠️ Dropped on expired column - status will not change, only visual grouping");
        return; // Expired column-д тавьсан бол status update хийхгүй
      }
      newStatus = over.id;
      console.log("✅ Found column from ID:", newStatus);
    }
    // 3. Task дээр тавьсан бол тухайн task-ийн column-ийг ашиглах
    else if (over.data?.current?.type === 'task') {
      newStatus = over.data.current.task.status;
      console.log("✅ Found status from target task:", newStatus);
    }
    // 4. Task ID байвал тухайн task-ийн status-ийг ашиглах
    else {
      const targetTask = tasks.find((t) => t.id === over.id);
      if (targetTask) {
        newStatus = targetTask.status;
        console.log("✅ Found status from task ID:", newStatus);
      } else {
        // 5. DOM element-ээс column ID олох (fallback)
        const columnElement = document.querySelector(`[data-column-id="${over.id}"]`);
        if (columnElement) {
          newStatus = columnElement.getAttribute('data-column-id');
          console.log("✅ Found column from DOM:", newStatus);
        } else {
          console.error("❌ Could not determine new status:", {
            overId: over.id,
            overData: over.data?.current,
            availableColumns: ["todo", "inProgress", "done"]
          });
          return;
        }
      }
    }

    console.log("Status change:", { 
      taskId: task.id, 
      taskTitle: task.title,
      oldStatus: task.status, 
      newStatus
    });

    // Хэрэв status өөрчлөгдсөн бол update хийх
    if (newStatus && task.status !== newStatus) {
      try {
        console.log("🔄 Updating task status via API...", {
          taskId: task.id,
          oldStatus: task.status,
          newStatus,
          backendStatus: statusMap[newStatus],
        });
        
        const response = await api.put(`/task/${task.id}`, {
          status: statusMap[newStatus],
        });
        
        console.log("✅ Task status updated successfully, response:", response);
        
        // Tasks state шууд шинэчлэх (optimistic update)
        setTasks((prevTasks) => {
          const updated = prevTasks.map((t) => {
            if (t.id === task.id) {
              return { ...t, status: newStatus };
            }
            return t;
          });
          console.log("📊 Tasks state updated:", updated.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status
          })));
          return updated;
        });
        
        // Backend-ээс дахин татах (sync)
        await loadTasks();
        
        toast({ title: "Status шинэчлэгдлээ", description: `Task "${task.title}" ${newStatus} болсон` });
      } catch (error) {
        console.error("❌ Failed to update task status:", error);
        toast({ title: "Алдаа гарлаа", description: "Status өөрчлөгдсөнгүй", variant: "destructive" });
      }
    } else {
      console.log("⏭️ Status unchanged, skipping update");
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const today = startOfDay(new Date());

  const filtered = tasks.filter((task) => {
    switch (filter) {
      case "today":
        return task.dueDate && isToday(new Date(task.dueDate));
      case "upcoming":
        return task.dueDate && new Date(task.dueDate) > today && task.status !== "done";
      case "completed":
        return task.status === "done";
      default:
        return true;
    }
  });

  // Expired tasks (хугацаа дууссан, гэхдээ done биш)
  const expired = filtered.filter((t) => {
    if (t.status === "done") return false;
    if (!t.dueDate) return false;
    return isPast(new Date(t.dueDate));
  });

  // Todo tasks (expired биш)
  const todo = filtered.filter((t) => {
    if (t.status !== "todo") return false;
    // Expired tasks-ийг хасах
    if (t.dueDate && isPast(new Date(t.dueDate))) return false;
    return true;
  });
  
  const inProgress = filtered.filter((t) => t.status === "inProgress");
  const done = filtered.filter((t) => t.status === "done");

  // Debug: Column distribution
  console.log("[Kanban] Tasks distribution:", {
    todo: todo.length,
    inProgress: inProgress.length,
    expired: expired.length,
    done: done.length,
    total: filtered.length,
  });

  // Pagination logic for list view
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTasks = view === "list" ? filtered.slice(startIndex, endIndex) : filtered;

  // Filter эсвэл view өөрчлөгдөхөд хуудас 1 болгох
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, view]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Даалгаврууд</h1>
            <p className="text-muted-foreground">Даалгавруудаа удирдах</p>
          </div>

          <Button onClick={() => setAddTaskOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Даалгавар нэмэх
          </Button>
        </div>

        <div className="flex justify-between">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">Бүгд</TabsTrigger>
              <TabsTrigger value="today">Өнөөдөр</TabsTrigger>
              <TabsTrigger value="upcoming">Удахгүй</TabsTrigger>
              <TabsTrigger value="completed">Дууссан</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex bg-muted p-1 rounded-lg">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
            </Button>

            <Button
              variant={view === "kanban" ? "secondary" : "ghost"}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : view === "list" ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <AnimatePresence>
                {                filtered.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground">Даалгавар олдсонгүй</p>
                      <Button
                        onClick={() => setAddTaskOpen(true)}
                        className="mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Даалгавар нэмэх
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  paginatedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      onOpenDetail={openDetail}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {filtered.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {filtered.length}-ээс {startIndex + 1}-{Math.min(endIndex, filtered.length)} харуулж байна
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Өмнөх
                  </Button>
                  <div className="flex items-center gap-1">
                    {(() => {
                      // Pagination logic: max 7 хуудас харуулах
                      let pages = [];
                      if (totalPages <= 7) {
                        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                      } else {
                        if (currentPage <= 4) {
                          pages = [1, 2, 3, 4, 5, '...', totalPages];
                        } else if (currentPage >= totalPages - 3) {
                          pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                        } else {
                          pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                        }
                      }
                      return pages.map((page, idx) => 
                        page === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                            ...
                          </span>
                        ) : (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className="w-9 h-9"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      );
                    })()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Дараах
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex gap-6 overflow-x-auto pb-4">
              <div className="flex min-w-full gap-6">
                <DroppableColumn
                  id="todo"
                  title="Хийгдээгүй"
                  tasks={todo}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onOpenDetail={openDetail}
                  bgColor="bg-muted/30"
                />
                <DroppableColumn
                  id="inProgress"
                  title="Хийгдэж байгаа"
                  tasks={inProgress}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onOpenDetail={openDetail}
                  bgColor="bg-blue-500/5"
                />
                <DroppableColumn
                  id="expired"
                  title="Хугацаа дууссан"
                  tasks={expired}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onOpenDetail={openDetail}
                  bgColor="bg-red-500/5"
                />
                <DroppableColumn
                  id="done"
                  title="Дууссан"
                  tasks={done}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onOpenDetail={openDetail}
                  bgColor="bg-green-500/5"
                />
              </div>
            </div>
            
            {/* Drag Overlay */}
            <DragOverlay>
              {activeId ? (
                <div className="opacity-80">
                  <TaskCard
                    task={tasks.find((t) => t.id === activeId)}
                    onToggle={() => {}}
                    onDelete={() => {}}
                    onOpenDetail={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <QuickActions
        onAddTask={() => setAddTaskOpen(true)}
        onStartFocus={() => setFocusModeOpen(true)}
      />

      <AddTaskDialog
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        refresh={loadTasks}
      />

      <FocusModeDialog
        open={focusModeOpen}
        onOpenChange={setFocusModeOpen}
      />

      <TaskDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        task={selectedTask}
        refresh={loadTasks}
        onToggle={toggleTask}
      />
    </Layout>
  );
}
