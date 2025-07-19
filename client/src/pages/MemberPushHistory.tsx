
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface PushRecord {
  id: string;
  event: {
    id: string;
    title: string;
    date: string;
    status: string;
  };
  message_type: string;
  status: 'success' | 'failed';
  pushed_at: string;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
}

const MemberPushHistory = () => {
  const { memberId } = useParams();
  const [records, setRecords] = useState<PushRecord[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (!memberId) return;
    loadMemberInfo();
    loadPushHistory();
  }, [memberId]);

  const loadMemberInfo = async () => {
    try {
      const response = await fetch(`/api/members/${memberId}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        setMember(result.data);
      }
    } catch (error) {
      console.error('載入會員資料錯誤:', error);
    }
  };

  const loadPushHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/push-records?memberId=${memberId}&limit=1000`);
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

  const handleRetryRecord = async (recordId: string, eventId: string) => {
    if (!confirm('確定要重推這筆記錄嗎？')) return;

    try {
      const response = await fetch('/api/push/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          memberIds: [memberId],
          messageType: 'manual_push'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`重推完成！成功：${result.successCount}，失敗：${result.failedCount}`);
        loadPushHistory();
      } else {
        alert(result.error || '重推失敗');
      }
    } catch (error) {
      console.error('重推錯誤:', error);
      alert('重推時發生錯誤');
    }
  };

  // 篩選記錄
  const filteredRecords = records.filter(record => {
    let dateMatch = true;
    let statusMatch = true;

    if (dateFilter) {
      const recordDate = new Date(record.pushed_at).toISOString().split('T')[0];
      dateMatch = recordDate === dateFilter;
    }

    if (statusFilter) {
      statusMatch = record.status === statusFilter;
    }

    return dateMatch && statusMatch;
  });

  // 統計資料
  const totalRecords = filteredRecords.length;
  const successCount = filteredRecords.filter(r => r.status === 'success').length;
  const failedCount = totalRecords - successCount;
  const successRate = totalRecords > 0 ? Math.round((successCount / totalRecords) * 100) : 0;

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
        <div>
          <h1 className="text-3xl font-bold">📨 會員推播歷史</h1>
          {member && (
            <p className="text-gray-600 mt-2">
              會員：{member.name} ({member.phone || member.email})
            </p>
          )}
        </div>
        <Link
          to="/admin/members"
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
        >
          返回會員列表
        </Link>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">總推播數</h3>
          <p className="text-3xl font-bold text-blue-600">{totalRecords}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">成功數</h3>
          <p className="text-3xl font-bold text-green-600">{successCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">失敗數</h3>
          <p className="text-3xl font-bold text-red-600">{failedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">成功率</h3>
          <p className="text-3xl font-bold text-purple-600">{successRate}%</p>
        </div>
      </div>

      {/* 篩選器 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">📋 篩選條件</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              推播日期
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              推播狀態
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部狀態</option>
              <option value="success">成功</option>
              <option value="failed">失敗</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateFilter('');
                setStatusFilter('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              清除篩選
            </button>
          </div>
        </div>
      </div>

      {/* 推播記錄表格 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">推播記錄 ({filteredRecords.length})</h2>
          <button
            onClick={loadPushHistory}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            🔄 重新載入
          </button>
        </div>
        
        {filteredRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {records.length === 0 ? '暫無推播記錄' : '沒有符合條件的記錄'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">活動名稱</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">活動日期</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">推播時間</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">推播類型</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">狀態</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      <Link
                        to={`/admin/event/${record.event.id}/push-history`}
                        className="text-blue-600 hover:underline"
                      >
                        {record.event.title}
                      </Link>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {new Date(record.event.date).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {new Date(record.pushed_at).toLocaleString('zh-TW')}
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
                      {record.status === 'failed' && (
                        <button
                          onClick={() => handleRetryRecord(record.id, record.event.id)}
                          className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600 transition-colors"
                        >
                          📤 重推
                        </button>
                      )}
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

export default MemberPushHistory;
