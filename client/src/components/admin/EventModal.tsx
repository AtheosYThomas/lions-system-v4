import React, { useState, useEffect } from 'react';

type EventData = {
  id?: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  max_attendees?: number;
};

interface Props {
  isOpen: boolean;
  mode: 'create' | 'edit';
  eventData?: EventData;
  onClose: () => void;
  onSuccess: () => void;
}

const EventModal: React.FC<Props> = ({
  isOpen,
  mode,
  eventData,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<EventData>({
    title: '',
    description: '',
    date: '',
    location: '',
    max_attendees: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventData && mode === 'edit') {
      const dateValue = eventData.date
        ? new Date(eventData.date).toISOString().slice(0, 16)
        : '';
      setForm({
        title: eventData.title || '',
        description: eventData.description || '',
        date: dateValue,
        location: eventData.location || '',
        max_attendees: eventData.max_attendees || undefined,
      });
    } else {
      setForm({
        title: '',
        description: '',
        date: '',
        location: '',
        max_attendees: undefined,
      });
    }
    setError(null);
  }, [eventData, mode, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]:
        name === 'max_attendees'
          ? value
            ? parseInt(value)
            : undefined
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        title: form.title,
        description: form.description || undefined,
        date: form.date,
        location: form.location || undefined,
        max_attendees: form.max_attendees || undefined,
      };

      const url =
        mode === 'create'
          ? '/api/admin/event/create'
          : `/api/admin/event/${eventData?.id}/update`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '儲存失敗');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? '新增活動' : '編輯活動'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動標題 *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="輸入活動標題"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動描述
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="輸入活動描述"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動日期時間 *
              </label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動地點
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="輸入活動地點"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大參與人數
              </label>
              <input
                type="number"
                name="max_attendees"
                value={form.max_attendees || ''}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="不限制則留空"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading || !form.title || !form.date}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '儲存中...' : '儲存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
