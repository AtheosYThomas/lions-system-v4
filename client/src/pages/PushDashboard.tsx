
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, CartesianGrid, BarChart, Bar
} from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

interface TrendData {
  date: string;
  success: number;
  fail: number;
}

interface SummaryData {
  status: string;
  _count: number;
}

interface TopEventData {
  eventId: string;
  status: string;
  _count: number;
}

interface DashboardData {
  trend: TrendData[];
  summary: SummaryData[];
  topEvents: TopEventData[];
}

interface EventStat {
  eventId: string;
  success: number;
  fail: number;
  total: number;
  successRate: number;
}

const PushDashboard = () => {
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [summary, setSummary] = useState<SummaryData[]>([]);
  const [topEvents, setTopEvents] = useState<TopEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [messageType, setMessageType] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (messageType) params.append('messageType', messageType);

      const response = await fetch(`/api/admin/push-dashboard-summary?${params.toString()}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setTrend(result.data.trend || []);
        setSummary(result.data.summary || []);
        setTopEvents(result.data.topEvents || []);
        setError('');
      } else {
        setError(result.error || '載入統計資料失敗');
      }
    } catch (error) {
      console.error('載入統計資料錯誤:', error);
      setError('載入統計資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  // 整理圓餅圖資料
  const summaryData = summary.map((s) => ({
    name: s.status === 'success' ? '成功' : '失敗',
    value: s._count,
    color: s.status === 'success' ? '#22c55e' : '#ef4444'
  }));

  // 計算總體統計
  const totalPushes = summary.reduce((sum, s) => sum + s._count, 0);
  const successCount = summary.find(s => s.status === 'success')?._count || 0;
  const failCount = summary.find(s => s.status === 'fail')?._count || 0;
  const successRate = totalPushes > 0 ? Math.round((successCount / totalPushes) * 100) : 0;

  // 整理活動統計
  const eventMap: Record<string, EventStat> = {};
  topEvents.forEach((r) => {
    if (!eventMap[r.eventId]) {
      eventMap[r.eventId] = { 
        eventId: r.eventId, 
        success: 0, 
        fail: 0, 
        total: 0, 
        successRate: 0 
      };
    }
    eventMap[r.eventId][r.status as 'success' | 'fail'] = r._count;
  });

  const topEventList = Object.values(eventMap)
    .map((e) => {
      e.total = e.success + e.fail;
      e.successRate = e.total > 0 ? Math.round((e.success / e.total) * 100) : 0;
      return e;
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // 整理趨勢圖資料 - 加入總計
  const trendWithTotal = trend.map(item => ({
    ...item,
    total: item.success + item.fail,
    date: new Date(item.date).toLocaleDateString('zh-TW', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">🔄 載入統計資料中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          ❌ {error}
        </div>
        <button 
          onClick={loadDashboardData}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          🔄 重新載入
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📊 推播統計儀表板</h1>
        <button
          onClick={loadDashboardData}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          🔄 重新載入
        </button>
      </div>

      {/* 篩選區塊 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">🔍 篩選條件</h2>
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              起始日期
            </label>
            <input
              type="date"
              className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結束日期
            </label>
            <input
              type="date"
              className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              訊息類型
            </label>
            <select
              className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
            >
              <option value="">全部類型</option>
              <option value="manual_push">手動推播</option>
              <option value="auto_reminder">自動提醒</option>
              <option value="event_notification">活動通知</option>
              <option value="checkin_reminder">報到提醒</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={loadDashboardData}
            >
              🔍 查詢
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setMessageType('');
                loadDashboardData();
              }}
            >
              🗑️ 清除
            </button>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">總推播數</h3>
          <p className="text-3xl font-bold text-blue-600">{totalPushes.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">成功推播</h3>
          <p className="text-3xl font-bold text-green-600">{successCount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">失敗推播</h3>
          <p className="text-3xl font-bold text-red-600">{failCount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">成功率</h3>
          <p className="text-3xl font-bold text-purple-600">{successRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 趨勢折線圖 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📈 每日推播趨勢</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendWithTotal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'success' ? '成功' : name === 'fail' ? '失敗' : '總計']}
                  labelFormatter={(label) => `日期: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="success" 
                  stroke="#22c55e" 
                  name="成功" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fail" 
                  stroke="#ef4444" 
                  name="失敗" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  name="總計" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 成功率圓餅圖 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🥧 推播成功率分布</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summaryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value} (${Math.round((entry.value / totalPushes) * 100)}%)`}
                >
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, '推播數']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 活動推播統計長條圖 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">📊 活動推播表現圖表</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topEventList.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="eventId" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="success" fill="#22c55e" name="成功" />
              <Bar dataKey="fail" fill="#ef4444" name="失敗" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 活動詳細統計表格 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📋 活動推播詳細統計</h2>
        
        {topEventList.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暫無活動推播資料</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">活動 ID</th>
                  <th className="border border-gray-200 px-4 py-2 text-center">成功數</th>
                  <th className="border border-gray-200 px-4 py-2 text-center">失敗數</th>
                  <th className="border border-gray-200 px-4 py-2 text-center">總數</th>
                  <th className="border border-gray-200 px-4 py-2 text-center">成功率</th>
                  <th className="border border-gray-200 px-4 py-2 text-center">狀態</th>
                </tr>
              </thead>
              <tbody>
                {topEventList.map((event, index) => (
                  <tr key={event.eventId} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 font-medium">
                      <div className="flex items-center">
                        <span className="mr-2">#{index + 1}</span>
                        {event.eventId}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <span className="text-green-600 font-semibold">{event.success}</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <span className="text-red-600 font-semibold">{event.fail}</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center font-semibold">
                      {event.total}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.successRate >= 90 ? 'bg-green-100 text-green-800' :
                        event.successRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.successRate}%
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      {event.successRate >= 90 ? '🟢 優秀' :
                       event.successRate >= 70 ? '🟡 良好' : '🔴 需改善'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 頁腳資訊 */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>📊 最後更新時間: {new Date().toLocaleString('zh-TW')}</p>
        <p>💡 提示: 資料會即時更新，建議定期檢視推播表現以優化通知策略</p>
      </div>
    </div>
  );
};

export default PushDashboard;
