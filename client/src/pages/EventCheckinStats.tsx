import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface AttendeeData {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkedInAt?: string;
  registeredAt?: string;
  deviceInfo?: string;
}

interface CheckinStatsData {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  totalCheckins: number;
  totalRegistrations: number;
  attendanceRate: number;
  maxAttendees: number;
  attendees: AttendeeData[];
  notCheckedIn: AttendeeData[];
  hourlyDistribution: { [hour: string]: number };
  statistics: {
    onTimeCheckins: number;
    lateCheckins: number;
    earlyCheckins: number;
  };
}

const EventCheckinStats: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [data, setData] = useState<CheckinStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/event/${eventId}/checkin`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || '獲取資料失敗');
        }

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || '資料格式錯誤');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知錯誤');
        console.error('獲取報到統計失敗:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const formatHourlyData = (hourlyDistribution: { [hour: string]: number }) => {
    const result: { hour: string; count: number }[] = [];

    // 轉換時間分布資料
    for (const [hour, count] of Object.entries(hourlyDistribution)) {
      result.push({
        hour: `${hour}:00`,
        count,
      });
    }

    // 按時間排序
    result.sort((a, b) => a.hour.localeCompare(b.hour));

    return result;
  };

  const handleExport = (type: 'checkin' | 'not-checkin') => {
    const url = `/api/admin/event/${eventId}/checkin/export?type=${type}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-red-600 text-center">
            <h2 className="text-lg font-semibold mb-2">載入失敗</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p>找不到資料</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* 標題區域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {data.eventTitle} - 報到統計
          </h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              📅 活動日期：{new Date(data.eventDate).toLocaleString('zh-TW')}
            </p>
            <p>📍 活動地點：{data.eventLocation}</p>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-blue-600 text-2xl mr-3">👥</div>
              <div>
                <p className="text-sm text-gray-600">報名人數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.totalRegistrations}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-green-600 text-2xl mr-3">✅</div>
              <div>
                <p className="text-sm text-gray-600">已報到</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.totalCheckins}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-orange-600 text-2xl mr-3">⏳</div>
              <div>
                <p className="text-sm text-gray-600">未報到</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.notCheckedIn.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-purple-600 text-2xl mr-3">📊</div>
              <div>
                <p className="text-sm text-gray-600">報到率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.attendanceRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 匯出功能 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📤 匯出報表</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleExport('checkin')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              匯出已報到名單 (CSV)
            </button>
            <button
              onClick={() => handleExport('not-checkin')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              匯出未報到名單 (CSV)
            </button>
          </div>
        </div>

        {/* 報到時段分布圖表 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📊 報到時段分布</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatHourlyData(data.hourlyDistribution)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 名單顯示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 已報到名單 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-green-600">
                ✅ 已報到名單 ({data.attendees.length})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      姓名
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      手機
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      報到時間
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.attendees.map((attendee, index) => (
                    <tr key={attendee.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {attendee.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {attendee.phone}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {attendee.checkedInAt
                          ? new Date(attendee.checkedInAt).toLocaleString(
                              'zh-TW'
                            )
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.attendees.length === 0 && (
                <div className="p-4 text-center text-gray-500">尚無人報到</div>
              )}
            </div>
          </div>

          {/* 未報到名單 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-orange-600">
                ⏳ 未報到名單 ({data.notCheckedIn.length})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      姓名
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      手機
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      報名時間
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.notCheckedIn.map((member, index) => (
                    <tr key={member.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {member.phone}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {member.registeredAt
                          ? new Date(member.registeredAt).toLocaleString(
                              'zh-TW'
                            )
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.notCheckedIn.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  所有人都已報到！
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCheckinStats;
