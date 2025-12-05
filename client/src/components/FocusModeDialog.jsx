import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Coffee, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_WORK_MIN = 25;
const DEFAULT_BREAK_MIN = 5;

export function FocusModeDialog({ open, onOpenChange }) {
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MIN);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MIN);

  const workDuration = workMinutes * 60;
  const breakDuration = breakMinutes * 60;

  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Notification permission хүсэх
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const totalTime = isBreak ? breakDuration : workDuration;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Vibration болон Audio дохио
  const playAlert = useCallback(() => {
    // 1. Vibration (утас дээр)
    if ('vibrate' in navigator) {
      // 3 удаа чичирнэ: 200ms чичрэх, 100ms зогс, 200ms чичрэх, 100ms зогс, 200ms чичрэх
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // 2. Audio дохио (beep)
    try {
      // AudioContext ашиглаж beep дуу үүсгэнэ
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // 3 удаа beep дуу гаргана
      [0, 0.3, 0.6].forEach((startTime) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Beep частота болон хэмжээ
        oscillator.frequency.value = 800; // 800Hz (өндөр дуу)
        gainNode.gain.value = 0.3; // Дуу чанга байхгүй
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + 0.15); // 150ms
      });
    } catch (err) {
      console.log('Audio not supported:', err);
    }

    // 3. Browser Notification (хэрэв зөвшөөрсөн бол)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Mode', {
        body: isBreak ? 'Амралт дууслаа! Ажлаа үргэлжлүүл.' : 'Focus session дууслаа! Амраарай.',
        icon: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'focus-mode',
      });
    }
  }, [isBreak]);

  const handleComplete = useCallback(() => {
    // Дохио өгнө
    playAlert();
    
    if (isBreak) {
      setIsBreak(false);
      setTimeLeft(workDuration);
    } else {
      setSessionsCompleted((s) => s + 1);
      setIsBreak(true);
      setTimeLeft(breakDuration);
    }
    setIsRunning(false);
  }, [isBreak, workDuration, breakDuration, playAlert]);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleComplete]);

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBreak ? (
              <>
                <Coffee className="w-5 h-5 text-chart-3" />
                Амрах цаг
              </>
            ) : (
              <>
                <Target className="w-5 h-5 text-primary" />
                Төвлөрөх горим
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-8 space-y-8">
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className={isBreak ? "text-chart-3" : "text-primary"}
                strokeDasharray={553}
                animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={timeLeft}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-4xl font-bold tabular-nums"
                  data-testid="text-timer"
                >
                  {formatTime(timeLeft)}
                </motion.span>
              </AnimatePresence>
              <span className="text-sm text-muted-foreground mt-1">
                {isBreak ? "Амраарай" : "Анхаарлаа төвлөрүүл"}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Ажлын минут</p>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={workMinutes}
                  onChange={(e) => {
                    const v = Number(e.target.value) || DEFAULT_WORK_MIN;
                    setWorkMinutes(v);
                    if (!isBreak) {
                      setTimeLeft(v * 60);
                    }
                  }}
                  className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Амралтын минут</p>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={breakMinutes}
                  onChange={(e) => {
                    const v = Number(e.target.value) || DEFAULT_BREAK_MIN;
                    setBreakMinutes(v);
                    if (isBreak) {
                      setTimeLeft(v * 60);
                    }
                  }}
                  className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm"
                />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="outline"
              onClick={reset}
              data-testid="button-reset-timer"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              className="w-24 h-12 rounded-full"
              onClick={toggleTimer}
              data-testid="button-toggle-timer"
            >
              {isRunning ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Өнөөдөр дуусгасан сешн
            </p>
            <p className="text-2xl font-semibold text-primary" data-testid="text-sessions-completed">
              {sessionsCompleted}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            {isBreak
              ? "Сайн ажиллалаа! Богино хугацаанд амраад, сунгаарай."
              : "Нэг даалгаврыг хийж дуусга. Анхаарал сарниулах зүйлийг багасга."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={playAlert}
          >
            🔔 Дохио шалгах
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
