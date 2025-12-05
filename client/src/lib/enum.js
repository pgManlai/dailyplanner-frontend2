
export const statusMap = {
  todo: "PENDING",
  inProgress: "IN_PROGRESS",
  done: "COMPLETED",
};

export const backendToFrontendStatus = {
  PENDING: "todo",
  IN_PROGRESS: "inProgress",
  COMPLETED: "done",
};

export const priorityMap = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

export const categoryMap = {
  work: "WORK",
  personal: "PERSONAL",
  health: "HEALTH",
  learning: "LEARNING",
  other: "OTHER",
};

export const normalizeTask = (task) => ({
  ...task,
  status: backendToFrontendStatus[task.status] || "todo",
  priority: task.priority.toLowerCase(),
  category: task.category?.toLowerCase(),
});
