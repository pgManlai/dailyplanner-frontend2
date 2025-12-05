// Frontend-only type definitions
// Connect these to your backend API when ready

export type Task = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  category?: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Meeting = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Goal = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message?: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: Date;
};

export type ChatMessage = {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

export type FocusSession = {
  id: string;
  userId: string;
  taskId?: string;
  duration: number;
  completedAt?: Date;
  createdAt: Date;
};

export type User = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};
