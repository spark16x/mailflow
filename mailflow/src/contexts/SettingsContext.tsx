'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  email: string;
  appPassword: string;
  isConnected: boolean;
  setEmail: (email: string) => void;
  setAppPassword: (password: string) => void;
  connect: (email: string, appPassword: string) => Promise<{success: boolean, error?: string}>;
  disconnect: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [email, setGmailEmail] = useState('');
  const [appPassword, setGmailAppPassword] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('gmail_email');
    const savedPassword = localStorage.getItem('gmail_app_password');
    const connected = localStorage.getItem('gmail_connection_status') === 'true';

    if (savedEmail) setGmailEmail(savedEmail);
    if (savedPassword) setGmailAppPassword(savedPassword);
    if (connected) setIsConnected(connected);
  }, []);

  const setEmail = (newEmail: string) => {
    setGmailEmail(newEmail);
  };

  const setAppPassword = (newPassword: string) => {
    setGmailAppPassword(newPassword);
  };

  const connect = async (testEmail: string, testPassword: string) => {
    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('gmail_email', testEmail);
        localStorage.setItem('gmail_app_password', testPassword);
        localStorage.setItem('gmail_connection_status', 'true');
        setGmailEmail(testEmail);
        setGmailAppPassword(testPassword);
        setIsConnected(true);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to connect.' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  const disconnect = () => {
    localStorage.removeItem('gmail_email');
    localStorage.removeItem('gmail_app_password');
    localStorage.removeItem('gmail_connection_status');
    setGmailEmail('');
    setGmailAppPassword('');
    setIsConnected(false);
  };

  return (
    <SettingsContext.Provider
      value={{
        email,
        appPassword,
        isConnected,
        setEmail,
        setAppPassword,
        connect,
        disconnect,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
