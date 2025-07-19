
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

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

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const EventCheckinStats: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<EventCheckinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'checkin' | 'not-checkin' | 'analytics'>('checkin');
  const [selectedChart, setSelectedChart] = useState<'hourly' | 'status' | 'timeline'>('hourly');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showActions, setShowActions] = useState(false);

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

  const getHourlyChartData = () => {
    if (!data || !data.hourlyDistribution) return [];

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    return hours.map(hour => ({
      hour: `${hour}:00`,
      count: data.hourlyDistribution[hour] || 0
    })).filter(item => item.count > 0);
  };

  const getStatusPieData = () => {
    if (!data) return [];

    return [
      { name: '已報到', value: data.totalCheckins, color: '#10B981' },
      { name: '未報到', value: data.notCheckedIn.length, color: '#EF4444' }
    ];
  };

  const getTimelinessData = () => {
    if (!data) return [];

    const { statistics } = data;
    return [
      { name: '提早報到', value: statistics.earlyCheckins, color: '#8B5CF6' },
      { name: '準時報到', value: statistics.onTimeCheckins, color: '#10B981' },
      { name: '遲到報到', value: statistics.lateCheckins, color: '#F59E0B' }
    ];
  };

  const filterMembers = (members: Member[]) => {
    if (!searchTerm) return members;
    return members.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.phone && member.phone.includes(searchTerm)) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredAttendees = data ? filterMembers(data.attendees) : [];
  const filteredNotCheckedIn = data ? filterMembers(data.notCheckedIn) : [];

  const renderChart = () => {
    if (!data) return null;

    switch (selectedChart) {
      case 'hourly':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 報到時間分布</h3>
            {getHourlyChartData().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>尚無報到資料</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getHourlyChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    formatter={(value) => [`${value} 人`, '報到人數']}
                    labelFormatter={(label) => `時段: ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                    name="報到人數"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        );

      case 'status':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🥧 報到狀態分布</h3>
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getStatusPieData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getStatusPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} 人`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 lg:pl-6 mt-4 lg:mt-0">
                <div className="space-y-3">
                  {getStatusPieData().map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-3"
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="font-medium">{entry.name}</span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: entry.color }}>
                        {entry.value} 人
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">⏰ 報到時間性分析</h3>
            {getTimelinessData().every(item => item.value === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">⏰</div>
                <p>尚無報到資料</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getTimelinessData()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => [`${value} 人`, '報到人數']} />
                  <Bar dataKey="value" fill="#8884d8">
                    {getTimelinessData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        );

      default:
        return null;
    }
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

      {/* 搜尋和操作區域 */}
      <div className="mb-6 space-y-4">
        {/* 搜尋框 */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋姓名、手機或 Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-400 hover:text-gray-600">✕</span>
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowActions(!showActions)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            ⚙️ 操作選單
          </button>
        </div>

        {/* 操作按鈕 */}
        {showActions && (
          <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
            <button
              onClick={() => exportToCsv('checkin')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              📊 匯出已報到 CSV
            </button>
            <button
              onClick={() => exportToCsv('not-checkin')}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              📋 匯出未報到 CSV
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              🔄 重新整理資料
            </button>
            <button
              onClick={() => {
                if (confirm('確定要重新載入所有統計資料嗎？')) {
                  window.location.reload();
                }
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              🔄 強制重整
            </button>
          </div>
        )}

        {searchTerm && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            🔍 搜尋結果: 已報到 {filteredAttendees.length} 位，未報到 {filteredNotCheckedIn.length} 位
          </div>
        )}
      </div>

      {/* 統計分析標籤頁 */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* 圖表選擇器 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">選擇統計圖表</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedChart('hourly')}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedChart === 'hourly'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 時段分布
              </button>
              <button
                onClick={() => setSelectedChart('status')}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedChart === 'status'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🥧 狀態分布
              </button>
              <button
                onClick={() => setSelectedChart('timeline')}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedChart === 'timeline'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⏰ 時間性分析
              </button>
            </div>
          </div>

          {renderChart()}
          
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">報到時間分析</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">提早報到：</span>
                  <span className="font-medium text-purple-600">{data.statistics.earlyCheckins} 人</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">準時報到：</span>
                  <span className="font-medium text-green-600">{data.statistics.onTimeCheckins} 人</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">遲到報到：</span>
                  <span className="font-medium text-orange-600">{data.statistics.lateCheckins} 人</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 已報到名單 */}
      {activeTab === 'checkin' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              已報到會員名單 ({filteredAttendees.length} 位 
              {searchTerm ? `/ 共 ${data.attendees.length} 位` : ''})
            </h3>
          </div>

          {filteredAttendees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                {searchTerm ? '🔍' : '👥'}
              </div>
              <p className="text-gray-500">
                {searchTerm ? '沒有符合搜尋條件的會員' : '尚無會員報到'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
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
                  {filteredAttendees.map((member, index) => (
                    <tr key={member.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
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

      {/* 未報到名單 */}
      {activeTab === 'not-checkin' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              未報到會員名單 ({filteredNotCheckedIn.length} 位
              {searchTerm ? `/ 共 ${data.notCheckedIn.length} 位` : ''})
            </h3>
          </div>

          {filteredNotCheckedIn.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-green-400 text-6xl mb-4">
                {searchTerm ? '🔍' : '✅'}
              </div>
              <p className="text-green-600 font-medium">
                {searchTerm ? '沒有符合搜尋條件的會員' : '所有報名會員都已報到！'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
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
                  {filteredNotCheckedIn.map((member, index) => (
                    <tr key={member.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
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
    </div>
  );
};

export default EventCheckinStats;
