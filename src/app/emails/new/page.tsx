'use client';

import { useState } from 'react';
import { useScheduler, ScheduledTask } from '@/contexts/SchedulerContext';
import { useSettings } from '@/contexts/SettingsContext';

export default function ComposePage() {
  const { draft, setDraft, setActiveTask, clearDraft } = useScheduler();
  const { email, appPassword, isConnected } = useSettings();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendNow = async () => {
    if (!isConnected) {
      setMessage({ type: 'error', text: 'Please connect Gmail in Settings first.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth: { email, password: appPassword },
          message: {
            to: draft.to,
            cc: draft.cc,
            bcc: draft.bcc,
            subject: draft.subject,
            body: draft.body,
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Email sent successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send email.' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    }

    setLoading(false);
  };

  const handleSchedule = () => {
    if (!isConnected) {
      setMessage({ type: 'error', text: 'Please connect Gmail in Settings first.' });
      return;
    }

    if (draft.scheduleType === 'now') {
      handleSendNow();
      return;
    }

    if (!draft.scheduledDate || !draft.scheduledTime) {
      setMessage({ type: 'error', text: 'Please select a date and time for scheduling.' });
      return;
    }

    const scheduledDateTime = new Date(`${draft.scheduledDate}T${draft.scheduledTime}`);

    if (scheduledDateTime.getTime() <= Date.now()) {
      setMessage({ type: 'error', text: 'Scheduled time must be in the future.' });
      return;
    }

    const task: ScheduledTask = {
      ...draft,
      id: crypto.randomUUID(),
      nextRunTime: scheduledDateTime.getTime(),
      remainingCount: draft.scheduleType === 'once' ? 1 : (draft.repeatCount === 'unlimited' ? 'unlimited' : parseInt(draft.repeatCount) || 1),
    };

    setActiveTask(task);
    setMessage({ type: 'success', text: 'Email scheduled successfully! Keep this app open to send scheduled emails.' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Compose Email</h1>
        <button
          onClick={clearDraft}
          className="text-red-600 hover:text-red-800 px-4 py-2 font-medium"
        >
          Clear Draft
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <input
              type="text"
              name="to"
              value={draft.to}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="recipient@example.com (comma separated)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">CC</label>
              <input
                type="text"
                name="cc"
                value={draft.cc}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BCC</label>
              <input
                type="text"
                name="bcc"
                value={draft.bcc}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              name="subject"
              value={draft.subject}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              name="body"
              value={draft.body}
              onChange={handleChange}
              rows={8}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            ></textarea>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-4">Scheduling Options</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Type</label>
              <select
                name="scheduleType"
                value={draft.scheduleType}
                onChange={handleChange}
                className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              >
                <option value="now">Send Now</option>
                <option value="once">Schedule Once</option>
                <option value="repeat">Repeat</option>
              </select>
            </div>

            {draft.scheduleType !== 'now' && (
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={draft.scheduledDate}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={draft.scheduledTime}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
              </div>
            )}

            {draft.scheduleType === 'repeat' && (
              <div className="space-y-4 pt-4 border-t border-gray-100 max-w-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Repeat every</span>
                  <input
                    type="number"
                    name="repeatInterval"
                    min="1"
                    value={draft.repeatInterval}
                    onChange={handleChange}
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                  <select
                    name="repeatUnit"
                    value={draft.repeatUnit}
                    onChange={handleChange}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  >
                    <option value="second">Seconds</option>
                    <option value="minute">Minutes</option>
                    <option value="hour">Hours</option>
                    <option value="day">Days</option>
                    <option value="week">Weeks</option>
                    <option value="month">Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repeat Count</label>
                  <select
                    name="repeatCount"
                    value={draft.repeatCount}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  >
                    <option value="unlimited">Unlimited</option>
                    <option value="1">1 time</option>
                    <option value="2">2 times</option>
                    <option value="5">5 times</option>
                    <option value="10">10 times</option>
                    <option value="20">20 times</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleSchedule}
            disabled={loading || !isConnected}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {draft.scheduleType === 'now' ? (loading ? 'Sending...' : 'Send Now') : 'Schedule Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
