

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkedInAt?: string;
  registeredAt?: string;
  deviceInfo?: string;
}

interface EventCheckinData {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation?: string;
  totalCheckins: number;
  totalRegistrations: number;
  attendanceRate: number;
  maxAttendees?: number;
  attendees: Member[];
  notCheckedIn: Member[];
  hourlyDistribution: { [hour: string]: number };
  statistics: {
    onTimeCheckins: number;
    lateCheckins: number;
    earlyCheckins: number;
  };
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
  const [activeTab, setActiveTab] = useState<'checkin' | 'not-checkin' | 'analytics'>('checkin');

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

  const exportToCsv = (type: 'checkin' | 'not-checkin' = 'checkin') => {
    if (!eventId) return;
    
    const url = `/api/admin/event/${eventId}/checkin/export?type=${type}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderHourlyChart = () => {
    if (!data || !data.hourlyDistribution) return null;

    const hours = Object.keys(data.hourlyDistribution).sort();
    const maxCount = Math.max(...Object.values(data.hourlyDistribution));

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">報到時間分布</h3>
        <div className="space-y-2">
          {hours.map(hour => {
            const count = data.hourlyDistribution[hour];
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={hour} className="flex items-center">
                <div className="w-12 text-sm text-gray-600">{hour}:00</div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-4 relative">
                    <div 
                      className="bg-blue-500 rounded-full h-4"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-8 text-sm text-gray-800 font-medium">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
    <div className="max-w-7xl mx-auto py-8 px-4">
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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{data.totalCheckins}</div>
            <div className="text-sm text-gray-600">已報到人數</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{data.notCheckedIn.length}</div>
            <div className="text-sm text-gray-600">未報到人數</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{data.attendanceRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">報到率</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-600">報名總數</div>
            <div className="text-xl font-bold text-purple-600">{data.totalRegistrations}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600">活動時間</div>
            <div className="text-sm text-gray-600">{formatDateTime(data.eventDate)}</div>
          </div>
        </div>

        {data.eventLocation && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium text-gray-600">活動地點：</span>
            <span className="text-sm text-gray-800">{data.eventLocation}</span>
          </div>
        )}
      </div>

      {/* 標籤頁導航 */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'checkin'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            已報到名單 ({data.attendees.length})
          </button>
          <button
            onClick={() => setActiveTab('not-checkin')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'not-checkin'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            未報到名單 ({data.notCheckedIn.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            統計分析
          </button>
        </nav>
      </div>

      {/* 操作按鈕 */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => exportToCsv('checkin')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          📊 匯出已報到 CSV
        </button>
        <button
          onClick={() => exportToCsv('not-checkin')}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          📋 匯出未報到 CSV
        </button>
      </div>

      {/* 標籤頁內容 */}
      {activeTab === 'checkin' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              已報到會員名單 ({data.attendees.length} 位)
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
                        <div className="text-sm text-gray-900">
                          {member.checkedInAt && formatDateTime(member.checkedInAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'not-checkin' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              未報到會員名單 ({data.notCheckedIn.length} 位)
            </h3>
          </div>

          {data.notCheckedIn.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-green-400 text-6xl mb-4">✅</div>
              <p className="text-green-600 font-medium">所有報名會員都已報到！</p>
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
                      報名時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.notCheckedIn.map((member, index) => (
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
                        <div className="text-sm text-gray-900">
                          {member.registeredAt && formatDateTime(member.registeredAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          未報到
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {renderHourlyChart()}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">報到統計摘要</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">總報名人數：</span>
                  <span className="font-medium">{data.totalRegistrations} 人</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">已報到人數：</span>
                  <span className="font-medium text-green-600">{data.totalCheckins} 人</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">未報到人數：</span>
                  <span className="font-medium text-red-600">{data.notCheckedIn.length} 人</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">報到率：</span>
                  <span className="font-bold text-blue-600">{data.attendanceRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">報到狀態分布</h3>
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span>已報到</span>
                    <span>{data.attendanceRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${data.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span>未報到</span>
                    <span>{(100 - data.attendanceRate).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full"
                      style={{ width: `${100 - data.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCheckinStats;

