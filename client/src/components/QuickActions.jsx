import { Plus, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Link } from "wouter";

export function QuickActions({ onAddTask, onStartFocus }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 right-6 flex flex-col gap-3 z-40"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/chatbot">
            <Button
              size="icon"
              variant="secondary"
              className="w-12 h-12 rounded-full shadow-lg"
              data-testid="button-quick-chatbot"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Open Assistant</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="w-12 h-12 rounded-full shadow-lg"
            onClick={onStartFocus}
            data-testid="button-quick-focus"
          >
            <Clock className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Start Focus Mode</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg"
            onClick={onAddTask}
            data-testid="button-quick-add-task"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Add Task</p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}
