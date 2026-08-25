'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useScheduler } from '@/contexts/SchedulerContext';
import Link from 'next/link';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, Mail, Settings, Play } from 'lucide-react';

export default function Home() {
  const { isConnected, email } = useSettings();
  const { activeTask, cancelActiveTask } = useScheduler();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gmail Status Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="text-gray-500" />
            <h2 className="text-xl font-semibold">Gmail Connection</h2>
          </div>

          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle2 size={20} />
                <span className="font-medium">Connected</span>
              </div>
              <p className="text-gray-600">
                Connected as: <span className="font-medium">{email}</span>
              </p>
              <Link
                href="/settings"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-block"
              >
                Manage Connection
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                <AlertCircle size={20} />
                <span className="font-medium">Not Connected</span>
              </div>
              <p className="text-gray-600">
                Connect your Gmail account to start sending emails.
              </p>
              <Link
                href="/settings"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block text-sm"
              >
                Connect Now
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Play className="text-gray-500" />
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Link
              href="/emails/new"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Mail className="text-blue-600" />
                <span className="font-medium">Compose New Email</span>
              </div>
              <span className="text-gray-400 group-hover:text-blue-500">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Scheduler Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="text-gray-500" />
            <h2 className="text-xl font-semibold">Current Scheduled Task</h2>
          </div>
          {activeTask && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span>Running</span>
            </div>
          )}
        </div>

        {activeTask ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-blue-800">
                <strong>Important:</strong> MailFlow uses browser-based scheduling.
                You must keep this tab open for your emails to be sent at the scheduled time.
                Closing the tab will pause the schedule until you return.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Email Subject</h3>
                <p className="font-medium text-gray-900 truncate" title={activeTask.subject}>
                  {activeTask.subject || '(No subject)'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Recipient(s)</h3>
                <p className="font-medium text-gray-900 truncate" title={activeTask.to}>
                  {activeTask.to}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Next Send Time</h3>
                <p className="font-medium text-gray-900 text-lg">
                  {format(new Date(activeTask.nextRunTime), 'PPP at p')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Schedule Configuration</h3>
                <p className="font-medium text-gray-900">
                  {activeTask.scheduleType === 'once'
                    ? 'One-time only'
                    : `Every ${activeTask.repeatInterval} ${activeTask.repeatUnit}(s)`
                  }
                </p>
                {activeTask.scheduleType === 'repeat' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Remaining: {activeTask.remainingCount === 'unlimited' ? 'Unlimited' : activeTask.remainingCount}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={cancelActiveTask}
                className="text-red-600 hover:text-red-800 font-medium px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel Scheduled Task
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active scheduled tasks</h3>
            <p className="text-gray-500 mb-6">
              Create a new email and set a schedule to see it here.
            </p>
            <Link
              href="/emails/new"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Compose Email
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
