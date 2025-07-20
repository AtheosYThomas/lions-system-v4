import React, { useEffect, useState } from 'react';

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

const CheckinConfirm: React.FC = () => {
  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus>({
    status: 'checking',
    message: '正在確認報到資訊...',
  });

  useEffect(() => {
    const initLiffAndCheckin = async () => {
      try {
        // 初始化 LIFF
        await window.liff.init({
          liffId: process.env.REACT_APP_LIFF_ID || 'YOUR_LIFF_ID',
        });

        if (!window.liff.isLoggedIn()) {
          window.liff.login();
          return;
        }

        // 取得 LINE User ID
        const profile = await window.liff.getProfile();
        const lineUserId = profile?.userId;

        if (!lineUserId) {
          setCheckinStatus({
            status: 'error',
            message: '無法取得 LINE 使用者資訊，請重新登入',
          });
          return;
        }

        // 先檢查會員身份
        const memberCheckRes = await fetch('/api/liff/check-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line_user_id: lineUserId }),
        });

        const memberResult = await memberCheckRes.json();

        if (!memberCheckRes.ok || !memberResult.exists) {
          setCheckinStatus({
            status: 'not_member',
            message: '您尚未註冊為會員，請先完成註冊',
          });
          return;
        }

        // 執行報到 - 使用現有的 checkin API
        // 假設使用預設活動ID，您可以根據實際需求調整
        const eventId = 'default-event-2024';
        const checkinRes = await fetch(`/api/checkin/${eventId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lineUserId: lineUserId,
            deviceInfo: navigator.userAgent,
          }),
        });

        const checkinResult = await checkinRes.json();

        if (checkinRes.ok) {
          if (checkinResult.success) {
            setCheckinStatus({
              status: 'success',
              message: '報到成功！',
              memberName: checkinResult.member?.name,
              checkinTime: new Date().toLocaleString('zh-TW'),
            });
          } else {
            setCheckinStatus({
              status: 'already',
              message: checkinResult.message || '您已完成報到',
            });
          }
        } else {
          if (checkinResult.error?.includes('已經簽到過了')) {
            setCheckinStatus({
              status: 'already',
              message: '您已完成報到，無需重複操作',
            });
          } else {
            setCheckinStatus({
              status: 'error',
              message: checkinResult.error || '報到失敗，請聯繫工作人員',
            });
          }
        }
      } catch (error) {
        console.error('報到流程發生錯誤:', error);
        setCheckinStatus({
          status: 'error',
          message: '發生未知錯誤，請稍後再試',
        });
      }
    };

    // 檢查 LIFF SDK 是否已載入
    if (typeof window !== 'undefined') {
      if (window.liff) {
        initLiffAndCheckin();
      } else {
        // 動態載入 LIFF SDK
        const script = document.createElement('script');
        script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
        script.onload = () => initLiffAndCheckin();
        script.onerror = () => {
          setCheckinStatus({
            status: 'error',
            message: 'LIFF SDK 載入失敗',
          });
        };
        document.head.appendChild(script);
      }
    }
  }, []);

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const handleRegister = () => {
    window.location.href = '/register';
  };

  const renderStatusIcon = () => {
    switch (checkinStatus.status) {
      case 'success':
        return <div className="text-6xl mb-4">✅</div>;
      case 'already':
        return <div className="text-6xl mb-4">⚠️</div>;
      case 'error':
        return <div className="text-6xl mb-4">❌</div>;
      case 'not_member':
        return <div className="text-6xl mb-4">👤</div>;
      default:
        return <div className="text-6xl mb-4">⏳</div>;
    }
  };

  const renderStatusColor = () => {
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

  const renderActionButton = () => {
    if (checkinStatus.status === 'not_member') {
      return (
        <button
          onClick={handleRegister}
          className="mt-6 px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          前往註冊
        </button>
      );
    }

    if (checkinStatus.status !== 'checking') {
      return (
        <button
          onClick={handleReturnHome}
          className="mt-6 px-8 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          返回首頁
        </button>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            北大獅子會報到系統
          </h1>
          <div className="w-20 h-1 bg-blue-500 mx-auto rounded"></div>
        </div>

        {renderStatusIcon()}

        <h2 className={`text-xl font-bold mb-4 ${renderStatusColor()}`}>
          {checkinStatus.status === 'checking' && '檢查報到狀態中...'}
          {checkinStatus.status === 'success' && '報到成功！'}
          {checkinStatus.status === 'already' && '已完成報到'}
          {checkinStatus.status === 'error' && '報到失敗'}
          {checkinStatus.status === 'not_member' && '尚未註冊'}
        </h2>

        <p className="text-gray-600 mb-4">{checkinStatus.message}</p>

        {checkinStatus.memberName && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800">
              <strong>會員：</strong>
              {checkinStatus.memberName}
            </p>
            {checkinStatus.checkinTime && (
              <p className="text-green-800">
                <strong>報到時間：</strong>
                {checkinStatus.checkinTime}
              </p>
            )}
          </div>
        )}

        {checkinStatus.status === 'success' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              🎉 歡迎參加活動！請向工作人員出示此畫面
            </p>
          </div>
        )}

        {renderActionButton()}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">如有任何問題，請聯繫工作人員</p>
        </div>
      </div>
    </div>
  );
};

export default CheckinConfirm;
