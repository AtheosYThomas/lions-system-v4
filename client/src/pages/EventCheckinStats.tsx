
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkedInAt: string;
  deviceInfo?: string;
}

interface EventCheckinData {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation?: string;
  totalCheckins: number;
  attendanceRate: number;
  maxAttendees?: number;
  attendees: Member[];
}

interface ApiResponse {
  success: boolean;
  data: EventCheckinData;
  error?: string;
}

const EventCheckinStats: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<EventCheckinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setError('缺少活動 ID');
      setLoading(false);
      return;
    }

    const fetchCheckinStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/event/${eventId}/checkin`);
        const result: ApiResponse = await response.json();

        if (response.ok && result.success) {
          setData(result.data);
        } else {
          setError(result.error || '獲取資料失敗');
        }
      } catch (err) {
        console.error('獲取報到統計失敗:', err);
        setError('網路連接錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckinStats();
  }, [eventId]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportToCsv = () => {
    if (!data) return;

    const csvContent = [
      ['姓名', '手機', 'Email', '報到時間', '裝置資訊'],
      ...data.attendees.map(member => [
        member.name,
        member.phone,
        member.email,
        formatDateTime(member.checkedInAt),
        member.deviceInfo || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${data.eventTitle}_報到名單.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">載入活動報到統計中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">載入失敗</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回管理頁面
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">無資料</h2>
          <p className="text-gray-500">找不到活動報到資料</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* 頁面標題 */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/admin')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
        >
          ← 返回管理頁面
        </button>
        <h1 className="text-3xl font-bold text-gray-800">活動報到統計</h1>
      </div>

      {/* 活動資訊卡片 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">{data.eventTitle}</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{data.totalCheckins}</div>
            <div className="text-sm text-gray-600">總報到人數</div>
          </div>
          
          {data.maxAttendees && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{data.attendanceRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">報到率</div>
            </div>
          )}
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-600">活動時間</div>
            <div className="text-sm text-gray-600">{formatDateTime(data.eventDate)}</div>
          </div>
          
          {data.eventLocation && (
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm font-medium text-orange-600">活動地點</div>
              <div className="text-sm text-gray-600">{data.eventLocation}</div>
            </div>
          )}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="mb-6">
        <button
          onClick={exportToCsv}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          📊 匯出 CSV
        </button>
      </div>

      {/* 報到會員清單 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            報到會員清單 ({data.attendees.length} 位)
          </h3>
        </div>

        {data.attendees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <p className="text-gray-500">尚無會員報到</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    手機
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    報到時間
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.attendees.map((member, index) => (
                  <tr key={member.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDateTime(member.checkedInAt)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCheckinStats;
