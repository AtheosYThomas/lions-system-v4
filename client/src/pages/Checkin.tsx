
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    liff: any;
  }
}

interface CheckinFormData {
  lineUserId: string;
  eventId: string;
  deviceInfo: string;
}

export default function Checkin() {
  const [formData, setFormData] = useState<CheckinFormData>({
    lineUserId: '',
    eventId: '',
    deviceInfo: navigator.userAgent
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        console.log('正在初始化 LIFF...');
        
        // 取得 LIFF 配置
        const configResponse = await fetch('/api/liff/config');
        const config = await configResponse.json();
        
        if (!config.success) {
          throw new Error('無法載入 LIFF 配置');
        }
        
        if (config.isDefault) {
          setMessage('⚠️ 使用預設 LIFF ID，功能可能無法正常運作');
          setLoading(false);
          return;
        }
        
        await window.liff.init({ 
          liffId: config.liffId 
        });
        
        if (!window.liff.isLoggedIn()) {
          setMessage('請先登入 LINE 帳號...');
          window.liff.login();
          return;
        }
        
        // 取得用戶資料
        const userProfile = await window.liff.getProfile();
        setProfile(userProfile);
        
        // 取得 context 中的資料
        const context = window.liff.getContext();
        console.log('LIFF Context:', context);
        console.log('User Profile:', userProfile);
        
        setFormData(prev => ({
          ...prev,
          lineUserId: userProfile.userId
        }));
        
        setMessage(`歡迎 ${userProfile.displayName}！`);
        setLoading(false);
        
      } catch (error) {
        console.error('LIFF 初始化失敗:', error);
        setMessage('LIFF 初始化失敗，請重新整理頁面');
        setLoading(false);
      }
    };

    // 檢查 LIFF SDK 是否已載入
    if (window.liff) {
      initLiff();
    } else {
      // 載入 LIFF SDK
      const script = document.createElement('script');
      script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
      script.onload = () => initLiff();
      script.onerror = () => {
        setMessage('無法載入 LIFF SDK');
        setLoading(false);
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lineUserId || !formData.eventId) {
      setMessage('請填寫所有必要欄位');
      return;
    }
    
    setLoading(true);
    setMessage('正在簽到...');
    
    try {
      const response = await fetch(`/api/checkin/checkin/${formData.eventId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          lineUserId: formData.lineUserId,
          deviceInfo: formData.deviceInfo
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ 簽到成功！歡迎 ${result.member?.name || profile?.displayName}`);
        
        // 3秒後關閉視窗（如果在 LINE 內）
        if (window.liff?.isInClient()) {
          setTimeout(() => {
            window.liff.closeWindow();
          }, 3000);
        }
      } else {
        setMessage(`❌ 簽到失敗：${result.message || result.error || '未知錯誤'}`);
      }
      
    } catch (error) {
      console.error('簽到請求失敗:', error);
      setMessage('❌ 簽到失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div>載入中...</div>
        {message && <p>{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>🎯 活動簽到</h2>
      
      {profile && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {profile.pictureUrl && (
              <img 
                src={profile.pictureUrl} 
                alt="Profile" 
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              />
            )}
            <div>
              <strong>{profile.displayName}</strong>
              <br />
              <small>{formData.lineUserId}</small>
            </div>
          </div>
        </div>
      )}
      
      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px',
          borderRadius: '5px',
          backgroundColor: message.includes('✅') ? '#d4edda' : 
                         message.includes('❌') ? '#f8d7da' : '#fff3cd',
          color: message.includes('✅') ? '#155724' : 
                 message.includes('❌') ? '#721c24' : '#856404'
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="lineUserId" style={{ display: 'block', marginBottom: '5px' }}>
            LINE User ID *
          </label>
          <input
            id="lineUserId"
            name="lineUserId"
            type="text"
            value={formData.lineUserId}
            readOnly
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#f8f9fa'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="eventId" style={{ display: 'block', marginBottom: '5px' }}>
            活動 ID *
          </label>
          <input
            id="eventId"
            name="eventId"
            type="text"
            value={formData.eventId}
            onChange={handleInputChange}
            placeholder="請輸入活動 ID"
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !formData.lineUserId}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '處理中...' : '確認簽到'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>設備資訊：{formData.deviceInfo.substring(0, 50)}...</p>
      </div>
    </div>
  );
}
