
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventModal from '../components/admin/EventModal';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  max_attendees?: number;
  status: string;
  created_at: string;
}

const AdminEventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // 建立查詢參數
      const params = new URLSearchParams();
      if (searchKeyword.trim()) {
        params.append('keyword', searchKeyword.trim());
      }
      if (filterMonth) {
        params.append('month', filterMonth);
      }

      const response = await fetch(`/api/admin/events?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '獲取活動列表失敗');
      }

      if (result.success) {
        setEvents(result.events);
      } else {
        throw new Error(result.error || '資料格式錯誤');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤');
      console.error('獲取活動列表失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchKeyword, filterMonth]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { text: '進行中', className: 'bg-green-100 text-green-800' },
      'cancelled': { text: '已取消', className: 'bg-red-100 text-red-800' },
      'completed': { text: '已結束', className: 'bg-gray-100 text-gray-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, className: 'bg-blue-100 text-blue-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  // 活動列表已由後端過濾，直接使用 events
  const filteredEvents = events;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">活動總覽</h1>
              <p className="text-gray-600 mt-2">管理所有活動與查看報到統計</p>
            </div>
            <button
              onClick={() => {
                setEditMode('create');
                setSelectedEvent(null);
                setModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ＋ 新增活動
            </button>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總活動數</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">進行中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">即將開始</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'active' && new Date(e.date) > new Date()).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已結束</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => new Date(e.date) < new Date()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 搜尋與篩選區 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 搜尋活動名稱
              </label>
              <input
                type="text"
                placeholder="輸入關鍵字搜尋..."
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 月份篩選
              </label>
              <input
                type="month"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearchKeyword('');
                  setFilterMonth('');
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                清除篩選
              </button>
            </div>
          </div>
          {(searchKeyword || filterMonth) && (
            <div className="mt-4 text-sm text-gray-600">
              找到 {events.length} 筆活動
              {searchKeyword && <span className="ml-2">關鍵字：「{searchKeyword}」</span>}
              {filterMonth && <span className="ml-2">月份：{filterMonth}</span>}
            </div>
          )}
        </div>

        {/* 活動列表 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">活動列表</h2>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {events.length === 0 ? '尚無活動' : '找不到符合條件的活動'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {events.length === 0 ? '開始建立第一個活動吧！' : '請嘗試調整搜尋條件'}
              </p>
              {events.length === 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setEditMode('create');
                      setSelectedEvent(null);
                      setModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    建立活動
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      活動名稱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      活動日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      地點
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      建立時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作 & 推播
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(event.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.location || '未設定'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(event.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(event.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditMode('edit');
                              setSelectedEvent(event);
                              setModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                            title="編輯活動"
                          >
                            ✏️ 編輯
                          </button>
                          <button
                            onClick={() => navigate(`/admin/event/${event.id}/checkin`)}
                            className="text-green-600 hover:text-green-900 font-medium"
                            title="查看報到統計"
                          >
                            🔗 報到
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`確定要推播「${event.title}」報到通知給所有會員？`)) return;
                              
                              try {
                                const response = await fetch(`/api/admin/event/${event.id}/notify`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ targetType: 'all' })
                                });
                                
                                const result = await response.json();
                                
                                if (response.ok) {
                                  alert(`📢 推播完成！\n✅ 成功: ${result.statistics.successCount}\n❌ 失敗: ${result.statistics.failedCount}`);
                                } else {
                                  alert(`推播失敗：${result.error}`);
                                }
                              } catch (error) {
                                alert('推播過程發生錯誤');
                                console.error('推播錯誤:', error);
                              }
                            }}
                            className="text-purple-600 hover:text-purple-900 font-medium"
                            title="推播報到通知"
                          >
                            📣 推播
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Event Modal */}
        <EventModal
          isOpen={modalOpen}
          mode={editMode}
          eventData={selectedEvent || undefined}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            fetchEvents(); // 重新載入活動列表
            setModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default AdminEventsList;
