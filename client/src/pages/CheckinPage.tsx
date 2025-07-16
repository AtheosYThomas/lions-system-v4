
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';

export default function CheckinPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [checkins, setCheckins] = useState([]);

  const handleCheckin = async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`/checkin/${eventId}`, {
        lineUserId: 'test-user-id', // 實際應從 LIFF 取得
        deviceInfo: navigator.userAgent
      });
      
      setMessage(response.data.message);
      loadCheckins();
    } catch (error) {
      setMessage('簽到失敗: ' + (error as any).response?.data?.error || '未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  const loadCheckins = async () => {
    if (!eventId) return;
    
    try {
      const response = await axios.get(`/checkin/${eventId}`);
      setCheckins(response.data.checkins);
    } catch (error) {
      console.error('載入簽到列表失敗:', error);
    }
  };

  useEffect(() => {
    loadCheckins();
  }, [eventId]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>活動簽到</h1>
      <button onClick={handleCheckin} disabled={loading}>
        {loading ? '簽到中...' : '立即簽到'}
      </button>
      {message && <p>{message}</p>}
      
      <h2>簽到列表</h2>
      <ul>
        {checkins.map((checkin: any, index) => (
          <li key={index}>
            {checkin.Member?.name} - {new Date(checkin.checkin_time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
    // 載入活動資訊
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
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>📝 活動簽到</h2>
      
      {eventInfo && (
        <div style={{ 
          padding: '15px', 
          marginBottom: '20px', 
          backgroundColor: '#f8f9fa',
          borderRadius: '5px'
        }}>
          <h3>{eventInfo.title}</h3>
          <p>📅 {new Date(eventInfo.event_date).toLocaleDateString()}</p>
          <p>📍 {eventInfo.location}</p>
        </div>
      )}

      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          borderRadius: '5px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleCheckin}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="lineUserId">LINE User ID *</label>
          <input
            type="text"
            id="lineUserId"
            name="lineUserId"
            value={checkinData.lineUserId}
            onChange={handleChange}
            required
            placeholder="請輸入您的 LINE User ID"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isSubmitting ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? '簽到中...' : '確認簽到'}
        </button>
      </form>
    </div>
  );
}
