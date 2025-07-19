
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    liff: any;
  }
}

export default function LiffPage() {
  const [status, setStatus] = useState('正在初始化 LINE 登入...');
  const [statusType, setStatusType] = useState<'loading' | 'success' | 'error'>('loading');

  const updateStatus = (message: string, type: 'loading' | 'success' | 'error' = 'loading') => {
    setStatus(message);
    setStatusType(type);
  };

  useEffect(() => {
    const initLiff = async () => {
      try {
        // 檢查是否在 LINE 環境中
        if (!window.liff) {
          updateStatus('❌ 此頁面需要在 LINE 應用程式中開啟', 'error');
          return;
        }

        // 取得 LIFF 配置
        updateStatus('正在載入 LIFF 配置...');
        const configResponse = await fetch('/api/liff/config');
        const config = await configResponse.json();

        if (!config.success) {
          throw new Error('無法載入 LIFF 配置');
        }

        if (config.isDefault) {
          updateStatus('⚠️ 使用預設 LIFF ID，功能可能無法正常運作', 'error');
          setTimeout(() => {
            updateStatus('請聯繫管理員設定正確的 LIFF App ID', 'error');
          }, 3000);
          return;
        }

        // 初始化 LIFF
        updateStatus('正在初始化 LINE 登入...');
        await window.liff.init({
          liffId: config.liffId
        });

        // 檢查登入狀態
        if (!window.liff.isLoggedIn()) {
          updateStatus('請登入 LINE 帳號...');
          window.liff.login();
          return;
        }

        // 獲取用戶資料
        updateStatus('正在取得用戶資料...');
        const profile = await window.liff.getProfile();

        // 檢查會員狀態
        updateStatus('正在檢查會員狀態...');
        const response = await fetch('/api/liff/check-member', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            line_user_id: profile.userId,
            display_name: profile.displayName,
            picture_url: profile.pictureUrl
          })
        });

        if (!response.ok) {
          throw new Error(`伺服器錯誤: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          if (result.is_member) {
            updateStatus(`✅ 歡迎回來，${result.member_name}！`, 'success');
          } else {
            updateStatus('🚀 導向至註冊頁面...');
            // 導向到 React 註冊頁面
            window.location.href = `/register?line_user_id=${encodeURIComponent(profile.userId)}&display_name=${encodeURIComponent(profile.displayName)}&picture_url=${encodeURIComponent(profile.pictureUrl || '')}`;
            return;
          }
        } else {
          updateStatus(`❌ 檢查失敗：${result.error || '未知錯誤'}`, 'error');
        }

        // 3秒後關閉視窗
        setTimeout(() => {
          if (window.liff.isInClient()) {
            window.liff.closeWindow();
          }
        }, 3000);

      } catch (error: any) {
        console.error('LIFF 初始化錯誤:', error);
        
        let errorMessage = '';
        let suggestion = '';
        
        if (error.code === 404) {
          errorMessage = 'LIFF App ID 不存在或未正確配置';
          suggestion = '請確認 LIFF App ID 是否正確，或聯繫系統管理員';
        } else if (error.code === 403) {
          errorMessage = 'LIFF 應用程式未啟用或權限不足';
          suggestion = '請檢查 LIFF 應用程式設定';
        } else if (error.code === 400) {
          errorMessage = 'LIFF 初始化參數錯誤';
          suggestion = '請檢查 LIFF App ID 格式';
        } else {
          errorMessage = error.message || '未知的 LIFF 錯誤';
          suggestion = '請稍後再試或聯繫技術支援';
        }
        
        updateStatus(`❌ ${errorMessage}`, 'error');
      }
    };

    // 動態載入 LIFF SDK
    const script = document.createElement('script');
    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
    script.onload = () => initLiff();
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: 0,
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🦁</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
            北大獅子會
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            會員註冊系統
          </div>
        </div>

        <div style={{
          padding: '15px',
          borderRadius: '10px',
          margin: '20px 0',
          textAlign: 'center',
          background: statusType === 'loading' ? '#e3f2fd' : 
                     statusType === 'success' ? '#e8f5e8' : '#ffebee',
          color: statusType === 'loading' ? '#1976d2' : 
                 statusType === 'success' ? '#2e7d32' : '#c62828',
          border: `1px solid ${statusType === 'loading' ? '#bbdefb' : 
                                statusType === 'success' ? '#c8e6c9' : '#ffcdd2'}`
        }}>
          {statusType === 'loading' && (
            <div style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #1976d2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '10px'
            }} />
          )}
          {status}
        </div>

        {statusType === 'error' && (
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔄 重新嘗試
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
