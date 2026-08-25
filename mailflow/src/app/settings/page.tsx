'use client';

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsPage() {
  const { email, appPassword, isConnected, connect, disconnect } = useSettings();
  const [testEmail, setTestEmail] = useState(email);
  const [testPassword, setTestPassword] = useState(appPassword);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await connect(testEmail, testPassword);

    if (result.success) {
      setMessage({ type: 'success', text: 'Gmail Connected successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to connect' });
    }

    setLoading(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setTestEmail('');
    setTestPassword('');
    setMessage(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Gmail SMTP Configuration</h2>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Security Warning:</strong> Gmail credentials are stored locally in this browser (localStorage). Do not use this application on shared or untrusted devices.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleTestConnection} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Gmail Address</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="example@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gmail App Password</label>
            <input
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="xxxx xxxx xxxx xxxx"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Use a 16-character app password generated from your Google Account settings.
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </button>

            <div className="flex items-center space-x-4">
              {isConnected && (
                <span className="text-green-600 font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  Gmail Connected
                </span>
              )}

              <button
                type="button"
                onClick={handleDisconnect}
                className="text-red-600 hover:text-red-800 px-4 py-2 font-medium"
              >
                Clear Gmail Credentials
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
