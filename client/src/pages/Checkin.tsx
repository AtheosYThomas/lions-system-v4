import { useEffect, useState } from 'react';

declare global {
  interface Window {
    liff: any;
  }
}

const Checkin = () => {
  const [status, setStatus] = useState('正在驗證身份，請稍候...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runLiffCheck = async () => {
      try {
        // 取得 LIFF 配置
        const configResponse = await fetch('/api/liff/config');
        const config = await configResponse.json();

        if (!config.success) {
          throw new Error('無法載入 LIFF 配置');
        }

        // 初始化 LIFF
        setStatus('正在初始化 LINE 登入...');
        await window.liff.init({ liffId: config.liffId });

        // 檢查登入狀態
        if (!window.liff.isLoggedIn()) {
          setStatus('請登入 LINE 帳號...');
          window.liff.login();
          return;
        }

        // 獲取用戶資料
        setStatus('正在取得用戶資料...');
        const profile = await window.liff.getProfile();
        const lineUserId = profile.userId;

        if (!lineUserId) {
          throw new Error('無法擷取 line_user_id');
        }

        console.log('📱 用戶 LINE ID:', lineUserId);

        // 檢查會員狀態
        setStatus('正在檢查會員狀態...');
        const response = await fetch('/api/liff/check-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line_user_id: lineUserId }),
        });

        if (!response.ok) {
          throw new Error(`伺服器錯誤: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          if (result.is_member) {
            setStatus('✅ 會員驗證成功，導向簽到頁面...');
            // 導向簽到確認頁面
            setTimeout(() => {
              window.location.href = '/checkin/confirm';
            }, 1500);
          } else {
            setStatus('🚀 尚未註冊，導向註冊頁面...');
            // 導向註冊頁面
            setTimeout(() => {
              window.location.href = `/register.html?line_user_id=${encodeURIComponent(lineUserId)}&display_name=${encodeURIComponent(profile.displayName)}&picture_url=${encodeURIComponent(profile.pictureUrl || '')}`;
            }, 1500);
          }
        } else {
          throw new Error(result.error || '會員檢查失敗');
        }

      } catch (error) {
        console.error('LIFF 初始化失敗或會員檢查錯誤:', error);
        setStatus(`❌ 錯誤：${error instanceof Error ? error.message : '未知錯誤'}`);
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

    // 執行 LIFF 檢查
    const initializeApp = async () => {
      try {
        setStatus('正在載入 LIFF SDK...');
        await loadLiffScript();
        await runLiffCheck();
      } catch (error) {
        console.error('初始化失敗:', error);
        setStatus(`❌ 初始化失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      initializeApp();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto">
        {isLoading && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        )}
        <p className="text-lg text-gray-600 mb-4">{status}</p>
        {!isLoading && (
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重新嘗試
          </button>
        )}
      </div>
    </div>
  );
};

export default Checkin;