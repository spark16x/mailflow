'use client';

import { ReactNode } from 'react';
import { SettingsProvider } from './SettingsContext';
import { SchedulerProvider } from './SchedulerContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <SchedulerProvider>
        {children}
      </SchedulerProvider>
    </SettingsProvider>
  );
}
