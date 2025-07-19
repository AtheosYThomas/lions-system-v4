
import { useState } from 'react';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  max_attendees?: number;
}

interface CreateEventForm {
  title: string;
  description: string;
  date: string;
  location: string;
  max_attendees: string;
}

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState<CreateEventForm>({
    title: '',
    description: '',
    date: '',
    location: '',
    max_attendees: ''
  });
  const [qrCode, setQrCode] = useState<string>('');
  const [checkinUrl, setCheckinUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const eventData = {
        title: form.title,
        description: form.description || undefined,
        date: form.date,
        location: form.location || undefined,
        max_attendees: form.max_attendees ? parseInt(form.max_attendees) : undefined
      };

      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: '活動建立成功！' });
        setQrCode(result.qrCode);
        setCheckinUrl(result.checkinUrl);
        
        // 重置表單
        setForm({
          title: '',
          description: '',
          date: '',
          location: '',
          max_attendees: ''
        });

        // 重新載入活動列表
        loadEvents();
      } else {
        setMessage({ type: 'error', text: result.error || '建立活動失敗' });
      }
    } catch (error) {
      console.error('建立活動錯誤:', error);
      setMessage({ type: 'error', text: '發生錯誤，請稍後再試' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const result = await response.json();

      if (response.ok && result.success) {
        setEvents(result.events);
      }
    } catch (error) {
      console.error('載入活動列表錯誤:', error);
    }
  };

  const generateQRForEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setQrCode(result.qrCode);
        setCheckinUrl(result.checkinUrl);
      }
    } catch (error) {
      console.error('生成 QR Code 錯誤:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">活動管理</h1>

      {/* 建立活動表單 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">建立新活動</h2>
        
        <form onSubmit={createEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              活動標題 *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入活動描述"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                活動日期 *
              </label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="輸入活動地點"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最大參與人數
            </label>
            <input
              type="number"
              name="max_attendees"
              value={form.max_attendees}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入最大參與人數（可選）"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {isLoading ? '建立中...' : '建立活動'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* QR Code 顯示 */}
      {qrCode && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">簽到 QR Code</h2>
          <div className="text-center">
            <img src={qrCode} alt="簽到 QR Code" className="mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">簽到網址：</p>
            <p className="text-sm text-blue-600 break-all">{checkinUrl}</p>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = qrCode;
                link.download = 'checkin-qrcode.png';
                link.click();
              }}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              下載 QR Code
            </button>
          </div>
        </div>
      )}

      {/* 活動列表 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">現有活動</h2>
          <button
            onClick={loadEvents}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            重新載入
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">尚無活動</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-600 mt-1">{event.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      日期：{new Date(event.date).toLocaleString('zh-TW')}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500">地點：{event.location}</p>
                    )}
                    {event.max_attendees && (
                      <p className="text-sm text-gray-500">最大參與人數：{event.max_attendees}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateQRForEvent(event.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      生成 QR Code
                    </button>
                    <a
                      href={`/admin/event/${event.id}/push-history`}
                      className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition-colors inline-block"
                    >
                      📨 推播歷史
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;
