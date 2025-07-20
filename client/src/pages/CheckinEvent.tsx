import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

declare global {
  interface Window {
    liff: any;
  }
}

interface CheckinStatus {
  status: 'checking' | 'success' | 'already' | 'error' | 'not_member';
  message: string;
  memberName?: string;
  eventTitle?: string;
  checkinTime?: string;
}

const CheckinEvent = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus>({
    status: 'checking',
    message: '正在驗證身份，請稍候...',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!eventId) {
      setCheckinStatus({
        status: 'error',
        message: '無效的活動編號',
      });
      setIsLoading(false);
      return;
    }

    const performCheckin = async () => {
      try {
        // 取得 LIFF 配置
        const configResponse = await fetch('/api/liff/config');
        const config = await configResponse.json();

        if (!config.success) {
          throw new Error('無法載入 LIFF 配置');
        }

        // 初始化 LIFF
        setCheckinStatus({
          status: 'checking',
          message: '正在初始化 LINE 登入...',
        });
        await window.liff.init({ liffId: config.liffId });

        // 檢查登入狀態
        if (!window.liff.isLoggedIn()) {
          setCheckinStatus({
            status: 'checking',
            message: '請登入 LINE 帳號...',
          });
          window.liff.login();
          return;
        }

        // 獲取用戶資料
        setCheckinStatus({
          status: 'checking',
          message: '正在取得用戶資料...',
        });
        const profile = await window.liff.getProfile();
        const lineUserId = profile.userId;

        if (!lineUserId) {
          throw new Error('無法擷取 LINE 使用者資訊');
        }

        // 檢查會員狀態
        setCheckinStatus({
          status: 'checking',
          message: '正在檢查會員狀態...',
        });
        const memberResponse = await fetch('/api/liff/check-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line_user_id: lineUserId }),
        });

        if (!memberResponse.ok) {
          throw new Error('無法驗證會員狀態');
        }

        const memberResult = await memberResponse.json();

        if (!memberResult.success || !memberResult.is_member) {
          setCheckinStatus({
            status: 'not_member',
            message: '您尚未註冊為會員，請先完成註冊',
          });
          setIsLoading(false);

          // 導向註冊頁面
          setTimeout(() => {
            window.location.href = `/register.html?line_user_id=${encodeURIComponent(lineUserId)}&display_name=${encodeURIComponent(profile.displayName)}&picture_url=${encodeURIComponent(profile.pictureUrl || '')}`;
          }, 2000);
          return;
        }

        // 執行報到
        setCheckinStatus({ status: 'checking', message: '正在執行報到...' });
        const checkinResponse = await fetch(`/api/checkin/${eventId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lineUserId: lineUserId,
            deviceInfo: navigator.userAgent,
          }),
        });

        const checkinResult = await checkinResponse.json();

        if (checkinResponse.ok) {
          if (checkinResult.success) {
            setCheckinStatus({
              status: 'success',
              message: '報到成功！',
              memberName: checkinResult.member?.name,
              eventTitle: checkinResult.event?.title,
              checkinTime: new Date().toLocaleString('zh-TW'),
            });
          } else {
            setCheckinStatus({
              status: 'already',
              message: checkinResult.message || '您已完成報到',
            });
          }
        } else {
          if (
            checkinResult.error?.includes('已經簽到過了') ||
            checkinResponse.status === 409
          ) {
            setCheckinStatus({
              status: 'already',
              message: '您已完成報到，無需重複操作',
            });
          } else {
            setCheckinStatus({
              status: 'error',
              message: checkinResult.error || '報到失敗，請稍後再試',
            });
          }
        }
      } catch (error) {
        console.error('報到流程錯誤:', error);
        setCheckinStatus({
          status: 'error',
          message: error instanceof Error ? error.message : '發生未知錯誤',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // 載入 LIFF SDK
    const loadLiffScript = () => {
      return new Promise((resolve, reject) => {
        if (window.liff) {
          resolve(window.liff);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.onload = () => resolve(window.liff);
        script.onerror = () => reject(new Error('LIFF SDK 載入失敗'));
        document.head.appendChild(script);
      });
    };

    // 執行流程
    const initializeCheckin = async () => {
      try {
        setCheckinStatus({
          status: 'checking',
          message: '正在載入 LIFF SDK...',
        });
        await loadLiffScript();
        await performCheckin();
      } catch (error) {
        console.error('初始化失敗:', error);
        setCheckinStatus({
          status: 'error',
          message: error instanceof Error ? error.message : '初始化失敗',
        });
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      initializeCheckin();
    }
  }, [eventId]);

  const getStatusIcon = () => {
    switch (checkinStatus.status) {
      case 'success':
        return '✅';
      case 'already':
        return '⚠️';
      case 'error':
        return '❌';
      case 'not_member':
        return '🚀';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (checkinStatus.status) {
      case 'success':
        return 'text-green-600';
      case 'already':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'not_member':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto">
        {isLoading && checkinStatus.status === 'checking' && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        )}

        <div className="text-6xl mb-4">{getStatusIcon()}</div>

        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {checkinStatus.status === 'success' && '報到成功'}
          {checkinStatus.status === 'already' && '已完成報到'}
          {checkinStatus.status === 'error' && '報到失敗'}
          {checkinStatus.status === 'not_member' && '尚未註冊'}
          {checkinStatus.status === 'checking' && '處理中...'}
        </h1>

        <p className="text-lg text-gray-600 mb-4">{checkinStatus.message}</p>

        {checkinStatus.memberName && (
          <p className="text-md text-gray-700 mb-2">
            會員：{checkinStatus.memberName}
          </p>
        )}

        {checkinStatus.eventTitle && (
          <p className="text-md text-gray-700 mb-2">
            活動：{checkinStatus.eventTitle}
          </p>
        )}

        {checkinStatus.checkinTime && (
          <p className="text-sm text-gray-500 mb-4">
            報到時間：{checkinStatus.checkinTime}
          </p>
        )}

        {!isLoading && checkinStatus.status === 'error' && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            重新嘗試
          </button>
        )}

        {checkinStatus.status === 'not_member' && (
          <div className="mt-4 text-sm text-gray-500">
            <p>將自動導向註冊頁面...</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">活動編號：{eventId}</p>
      </div>
    </div>
  );
};

export default CheckinEvent;
