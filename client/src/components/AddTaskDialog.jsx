import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/helper'
import {priorityMap, categoryMap} from '@/lib/enum'
export function AddTaskDialog({ open, onOpenChange, defaultDate, refresh }) {
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState(defaultDate || undefined);
  const [dueTime, setDueTime] = useState("09:00");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory("");
    setDueDate(undefined);
    setDueTime("09:00");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    try {
      let finalDueDate = null;
      if (dueDate) {
        // Combine date + time
        const [hours, minutes] = dueTime.split(":").map(Number);
        const combined = new Date(dueDate);
        combined.setHours(hours, minutes, 0, 0);
        finalDueDate = combined.toISOString();
      }

      await api.send("/task/create-task", {
        title: title.trim(),
        description: description.trim() || null,
        priority: priorityMap[priority],
        category: categoryMap[category],
        dueDate: finalDueDate,
      });

      toast({
        title: "Task created",
        description: "Your task has been added successfully.",
      });

      resetForm();
      onOpenChange(false);

      if (refresh) refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Шинэ даалгавар нэмэх</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Гарчиг</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Юу хийх хэрэгтэй вэ?"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Тайлбар</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Дэлгэрэнгүй мэдээлэл нэмэх..."
            />
          </div>

          {/* Priority + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Чухал байдал</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Бага</SelectItem>
                  <SelectItem value="medium">Дунд</SelectItem>
                  <SelectItem value="high">Өндөр</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ангилал</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Ажил</SelectItem>
                  <SelectItem value="personal">Хувийн</SelectItem>
                  <SelectItem value="health">Эрүүл мэнд</SelectItem>
                  <SelectItem value="learning">Сурлага</SelectItem>
                  <SelectItem value="other">Бусад</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Дуусах огноо</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Огноо сонгох"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Due Time */}
          {dueDate && (
            <div className="space-y-2">
              <Label htmlFor="due-time">Цаг</Label>
              <Input
                id="due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Болих
            </Button>

            <Button type="submit" disabled={!title.trim() || loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Даалгавар нэмэх
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
