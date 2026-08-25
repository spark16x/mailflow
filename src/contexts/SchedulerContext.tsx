'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { addSeconds, addMinutes, addHours, addDays, addWeeks, addMonths } from 'date-fns';
import { useSettings } from './SettingsContext';

export interface EmailDraft {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  scheduleType: string;
  scheduledDate: string;
  scheduledTime: string;
  repeatInterval: number;
  repeatUnit: string;
  repeatCount: string;
}

export interface ScheduledTask extends EmailDraft {
  id: string;
  nextRunTime: number;
  remainingCount: number | 'unlimited';
}

interface SchedulerContextType {
  draft: EmailDraft;
  setDraft: React.Dispatch<React.SetStateAction<EmailDraft>>;
  activeTask: ScheduledTask | null;
  setActiveTask: (task: ScheduledTask | null) => void;
  clearDraft: () => void;
  cancelActiveTask: () => void;
}

const defaultDraft: EmailDraft = {
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
  scheduleType: 'now',
  scheduledDate: '',
  scheduledTime: '',
  repeatInterval: 1,
  repeatUnit: 'day',
  repeatCount: '1',
};

const SchedulerContext = createContext<SchedulerContextType | undefined>(undefined);

export const SchedulerProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraftState] = useState<EmailDraft>(defaultDraft);
  const [activeTask, setActiveTaskState] = useState<ScheduledTask | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { email, appPassword, isConnected } = useSettings();

  useEffect(() => {
    const savedDraft = sessionStorage.getItem('mailflow_email_form');
    const savedTask = sessionStorage.getItem('mailflow_active_task');

    if (savedDraft) {
      try {
        setDraftState(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Failed to parse draft from sessionStorage", e);
      }
    }

    if (savedTask) {
      try {
        setActiveTaskState(JSON.parse(savedTask));
      } catch (e) {
         console.error("Failed to parse active task from sessionStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const setDraft: React.Dispatch<React.SetStateAction<EmailDraft>> = (value) => {
    if (!isLoaded) return;
    setDraftState((prevDraft) => {
      const newDraft = typeof value === 'function' ? value(prevDraft) : value;
      sessionStorage.setItem('mailflow_email_form', JSON.stringify(newDraft));
      return newDraft;
    });
  };

  const setActiveTask = (task: ScheduledTask | null) => {
    setActiveTaskState(task);
    if (task) {
      sessionStorage.setItem('mailflow_active_task', JSON.stringify(task));
    } else {
      sessionStorage.removeItem('mailflow_active_task');
    }
  };

  const clearDraft = () => {
    setDraftState(defaultDraft);
    sessionStorage.removeItem('mailflow_email_form');
  };

  const cancelActiveTask = () => {
    setActiveTask(null);
  };

  const calculateNextRunTime = (task: ScheduledTask): number => {
    const currentDate = new Date(task.nextRunTime);
    const interval = task.repeatInterval;

    switch (task.repeatUnit) {
      case 'second': return addSeconds(currentDate, interval).getTime();
      case 'minute': return addMinutes(currentDate, interval).getTime();
      case 'hour': return addHours(currentDate, interval).getTime();
      case 'day': return addDays(currentDate, interval).getTime();
      case 'week': return addWeeks(currentDate, interval).getTime();
      case 'month': return addMonths(currentDate, interval).getTime();
      default: return addDays(currentDate, interval).getTime();
    }
  };

  const executeTask = useCallback(async (task: ScheduledTask) => {
    if (!isConnected || !email || !appPassword) {
      console.error("Cannot execute task: Gmail not connected");
      return;
    }

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth: { email, password: appPassword },
          message: {
            to: task.to,
            cc: task.cc,
            bcc: task.bcc,
            subject: task.subject,
            body: task.body,
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`Email sent successfully for task ${task.id}`);

        if (task.scheduleType === 'once' || (task.remainingCount !== 'unlimited' && task.remainingCount <= 1)) {
          // Task complete
          setActiveTask(null);
        } else {
          // Schedule next run
          const nextTask: ScheduledTask = {
            ...task,
            nextRunTime: calculateNextRunTime(task),
            remainingCount: task.remainingCount === 'unlimited' ? 'unlimited' : task.remainingCount - 1,
          };
          setActiveTask(nextTask);
        }
      } else {
        console.error(`Failed to send email for task ${task.id}:`, data.error);
        // On error, we could retry or cancel. Let's cancel for now to prevent spam loops on auth errors.
        setActiveTask(null);
      }
    } catch (error) {
      console.error(`Error executing task ${task.id}:`, error);
      setActiveTask(null);
    }
  }, [isConnected, email, appPassword]);

  // The actual Scheduler logic
  useEffect(() => {
    if (!activeTask || !isConnected) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now >= activeTask.nextRunTime) {
        executeTask(activeTask);
      }
    }, 1000); // Check every second

    return () => clearInterval(intervalId);
  }, [activeTask, isConnected, executeTask]);

  return (
    <SchedulerContext.Provider
      value={{
        draft,
        setDraft,
        activeTask,
        setActiveTask,
        clearDraft,
        cancelActiveTask
      }}
    >
      {children}
    </SchedulerContext.Provider>
  );
};

export const useScheduler = () => {
  const context = useContext(SchedulerContext);
  if (context === undefined) {
    throw new Error('useScheduler must be used within a SchedulerProvider');
  }
  return context;
};
