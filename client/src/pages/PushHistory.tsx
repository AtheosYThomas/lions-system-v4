
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

interface PushRecord {
  id: string;
  member: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  status: 'success' | 'failed';
  pushed_at: string;
  message_type: string;
}

interface PushStatistics {
  total: number;
  success: number;
  failed: number;
  successRate: number;
}

const COLORS = {
  success: '#22c55e',
  failed: '#ef4444'
};

const PushHistory = () => {
  const { eventId } = useParams();
  const [records, setRecords] = useState<PushRecord[]>([]);
  const [statistics, setStatistics] = useState<PushStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [retryLoading, setRetryLoading] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    loadPushHistory();
    loadStatistics();
  }, [eventId]);

  const loadPushHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/push-records?eventId=${eventId}&limit=1000`);
      const result = await response.json();

      if (response.ok && result.success) {
        setRecords(result.data || []);
      } else {
        setError(result.error || '載入推播記錄失敗');
      }
    } catch (error) {
      console.error('載入推播記錄錯誤:', error);
      setError('載入推播記錄時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(`/api/push-records/stats/${eventId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('載入統計資料錯誤:', error);
    }
  };

  const handleRetryFailed = async () => {
    if (!eventId) return;

    const failedRecords = records.filter(r => r.status === 'failed');
    if (failedRecords.length === 0) {
      alert('沒有失敗的推播記錄需要重推');
      return;
    }

    if (!confirm(`確定要重推 ${failedRecords.length} 筆失敗的推播記錄嗎？`)) {
      return;
    }

    try {
      setRetryLoading(true);
      const memberIds = failedRecords.map(r => r.member.id);

      const response = await fetch('/api/push/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          memberIds,
          messageType: 'manual_push'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`重推完成！成功：${result.successCount}，失敗：${result.failedCount}`);
        // 重新載入資料
        loadPushHistory();
        loadStatistics();
      } else {
        alert(result.error || '重推失敗');
      }
    } catch (error) {
      console.error('重推錯誤:', error);
      alert('重推時發生錯誤');
    } finally {
      setRetryLoading(false);
    }
  };

  const failedRecords = records.filter(r => r.status === 'failed');

  const pieData = statistics ? [
    { name: '成功', value: statistics.success, color: COLORS.success },
    { name: '失敗', value: statistics.failed, color: COLORS.failed }
  ] : [];

  const messageTypeStats = records.reduce((acc: any, record) => {
    const type = record.message_type || 'unknown';
    if (!acc[type]) {
      acc[type] = { success: 0, failed: 0 };
    }
    acc[type][record.status]++;
    return acc;
  }, {});

  const barData = Object.entries(messageTypeStats).map(([type, stats]: [string, any]) => ({
    type,
    success: stats.success,
    failed: stats.failed
  }));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📨 推播記錄分析</h1>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
        >
          返回
        </button>
      </div>

      {/* 統計卡片 */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">總推播數</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">成功數</h3>
            <p className="text-3xl font-bold text-green-600">{statistics.success}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">失敗數</h3>
            <p className="text-3xl font-bold text-red-600">{statistics.failed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">成功率</h3>
            <p className="text-3xl font-bold text-purple-600">{statistics.successRate}%</p>
          </div>
        </div>
      )}

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 圓餅圖 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">成功／失敗比例</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 柱狀圖 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">各類型推播統計</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" fill={COLORS.success} name="成功" />
                <Bar dataKey="failed" fill={COLORS.failed} name="失敗" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">操作功能</h2>
          <div className="space-x-4">
            <button
              onClick={loadPushHistory}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              🔄 重新載入
            </button>
            {failedRecords.length > 0 && (
              <button
                onClick={handleRetryFailed}
                disabled={retryLoading}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors"
              >
                {retryLoading ? '重推中...' : `📤 重推失敗記錄 (${failedRecords.length})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 詳細記錄表格 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">詳細記錄</h2>
        
        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暫無推播記錄</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">會員姓名</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">聯絡方式</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">推播類型</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">狀態</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">推播時間</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      {record.member.name || 'N/A'}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div>
                        {record.member.phone && <div>📱 {record.member.phone}</div>}
                        {record.member.email && <div>📧 {record.member.email}</div>}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {record.message_type || 'N/A'}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status === 'success' ? '✅ 成功' : '❌ 失敗'}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {new Date(record.pushed_at).toLocaleString('zh-TW')}
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

export default PushHistory;
