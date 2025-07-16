import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface CheckinData {
  lineUserId: string;
  deviceInfo?: string;
}

export default function CheckinPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [checkinData, setCheckinData] = useState<CheckinData>({
    lineUserId: '',
    deviceInfo: navigator.userAgent
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [eventInfo, setEventInfo] = useState<any>(null);

  useEffect(() => {
    const loadEventInfo = async () => {
      try {
        const response = await axios.get(`/events/${eventId}`);
        setEventInfo(response.data);
      } catch (error) {
        setMessage('❌ 無法載入活動資訊');
      }
    };

    if (eventId) {
      loadEventInfo();
    }
  }, [eventId]);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(`/checkin/${eventId}`, checkinData);
      setMessage('✅ 簽到成功！');
      setCheckinData({ ...checkinData, lineUserId: '' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '簽到失敗，請稍後再試';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckinData({
      ...checkinData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-xl bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">📝 活動簽到</h2>

      {eventInfo && (
        <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800">{eventInfo.title}</h3>
          <p className="text-blue-600 text-sm">📅 {new Date(eventInfo.event_date).toLocaleDateString()}</p>
          <p className="text-blue-600 text-sm">📍 {eventInfo.location}</p>
        </div>
      )}

      {message && (
        <div className={`p-4 mb-6 rounded-lg text-center ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleCheckin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LINE User ID *</label>
          <Input
            type="text"
            name="lineUserId"
            value={checkinData.lineUserId}
            onChange={handleChange}
            placeholder="請輸入您的 LINE User ID"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          variant={isSubmitting ? "secondary" : "default"}
        >
          {isSubmitting ? '簽到中...' : '確認簽到'}
        </Button>
      </form>
    </div>
  );
}