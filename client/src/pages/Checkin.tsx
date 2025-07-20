
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    liff: any;
  }
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  registration_status: 'registered' | 'not_registered';
  checkin_status: 'checked_in' | 'not_checked_in';
  checkin_time?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  events: Event[];
}

interface CheckinResponse {
  success: boolean;
  is_member: boolean;
  member?: Member;
  error?: string;
}

const Checkin = () => {
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkinLoading, setCheckinLoading] = useState<string | null>(null);

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        // 載入 LIFF SDK
        if (!window.liff) {
          await loadLiffScript();
        }

        // 取得 LIFF 配置
        const configResponse = await fetch('/api/liff/config');
        const config = await configResponse.json();

        if (!config.success) {
          throw new Error('無法載入 LIFF 配置');
        }

        // 初始化 LIFF
        await window.liff.init({ liffId: config.liffId });

        // 檢查登入狀態
        if (!window.liff.isLoggedIn()) {
          window.liff.login();
          return;
        }

        // 獲取用戶資料
        const profile = await window.liff.getProfile();
        const userId = profile.userId;

        if (!userId) {
          throw new Error('無法擷取 LINE 用戶 ID');
        }

        setLineUserId(userId);
        await checkMemberStatus(userId);

      } catch (error) {
        console.error('LIFF 初始化失敗:', error);
        setError(error instanceof Error ? error.message : '初始化失敗');
        setLoading(false);
      }
    };

    const loadLiffScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('LIFF SDK 載入失敗'));
        document.head.appendChild(script);
      });
    };

    const checkMemberStatus = async (userId: string) => {
      try {
        const response = await fetch('/api/liff/check-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line_user_id: userId })
        });

        const result: CheckinResponse = await response.json();

        if (result.success && result.is_member && result.member) {
          // 獲取會員的活動資訊
          await fetchMemberEvents(result.member.id);
        } else {
          // 不是會員，導向註冊頁面
          window.location.href = `/register.html?line_user_id=${encodeURIComponent(userId)}`;
        }
      } catch (error) {
        console.error('檢查會員身份失敗:', error);
        setError('檢查會員身份失敗，請稍後再試');
        setLoading(false);
      }
    };

    const fetchMemberEvents = async (memberId: string) => {
      try {
        const response = await fetch(`/api/members/${memberId}/events`);
        const result = await response.json();

        if (result.success) {
          setMember(result.member);
        } else {
          throw new Error(result.error || '獲取活動資訊失敗');
        }
      } catch (error) {
        console.error('獲取活動資訊失敗:', error);
        setError('獲取活動資訊失敗');
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      initializeLiff();
    }
  }, []);

  const handleCheckin = async (eventId: string) => {
    if (!lineUserId) return;

    setCheckinLoading(eventId);
    try {
      const response = await fetch(`/api/checkin/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lineUserId: lineUserId,
          deviceInfo: navigator.userAgent 
        })
      });

      const result = await response.json();

      if (result.success) {
        // 更新本地狀態
        setMember(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            events: prev.events.map(event => 
              event.id === eventId 
                ? { ...event, checkin_status: 'checked_in' as const, checkin_time: new Date().toISOString() }
                : event
            )
          };
        });
        alert('簽到成功！');
      } else {
        alert(result.error || '簽到失敗');
      }
    } catch (error) {
      console.error('簽到失敗:', error);
      alert('簽到失敗，請稍後再試');
    } finally {
      setCheckinLoading(null);
    }
  };

  const getEventStatusIcon = (event: Event) => {
    if (event.checkin_status === 'checked_in') return '✅';
    if (event.registration_status === 'not_registered') return '❌';
    if (event.status === 'completed') return '⏰';
    return '⏳';
  };

  const getEventStatusText = (event: Event) => {
    if (event.checkin_status === 'checked_in') return '已簽到';
    if (event.registration_status === 'not_registered') return '未報名';
    if (event.status === 'completed') return '活動已結束';
    return '尚未簽到';
  };

  const canCheckin = (event: Event) => {
    return event.registration_status === 'registered' && 
           event.checkin_status === 'not_checked_in' && 
           event.status !== 'completed';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">載入中，請稍候...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">發生錯誤</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">會員驗證中</h2>
          <p className="text-gray-600">正在驗證會員身份...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                歡迎，{member.name}！
              </h1>
              <p className="text-gray-600 mt-1">
                身份：{member.role === 'officer' ? '幹部' : '會員'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">LINE ID: {lineUserId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              我的活動 ({member.events.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {member.events.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p>目前沒有活動資訊</p>
              </div>
            ) : (
              member.events.map((event) => (
                <div key={event.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getEventStatusIcon(event)}</span>
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">
                            {event.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>📅 {new Date(event.date).toLocaleDateString('zh-TW')}</span>
                            {event.location && <span>📍 {event.location}</span>}
                          </div>
                          <div className="mt-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              event.checkin_status === 'checked_in' 
                                ? 'bg-green-100 text-green-800'
                                : event.registration_status === 'registered'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {getEventStatusText(event)}
                            </span>
                            {event.checkin_time && (
                              <span className="ml-2 text-xs text-gray-500">
                                簽到時間: {new Date(event.checkin_time).toLocaleString('zh-TW')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {canCheckin(event) && (
                        <button
                          onClick={() => handleCheckin(event.id)}
                          disabled={checkinLoading === event.id}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {checkinLoading === event.id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              簽到中...
                            </span>
                          ) : (
                            '立即簽到'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50"
          >
            刷新頁面
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkin;
