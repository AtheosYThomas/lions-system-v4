
import React, { useEffect, useState } from 'react';
import liff from '@line/liff';

export default function Register() {
  const [lineId, setLineId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffId = import.meta.env.VITE_LIFF_ID;
        console.log('LIFF ID:', liffId);
        
        if (!liffId) {
          throw new Error('LIFF ID 未設定');
        }

        await liff.init({ liffId });
        
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setLineId(profile.userId);
        } else {
          liff.login();
        }
      } catch (err: any) {
        console.error('LIFF 初始化錯誤:', err);
        setError(`LIFF 初始化失敗: ${err.message || err.code || '未知錯誤'}`);
      } finally {
        setLoading(false);
      }
    };

    initLiff();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>載入中...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>錯誤</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => window.location.reload()}>重新載入</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>會員註冊</h2>
      <p>LINE UID: {lineId}</p>
      {lineId && (
        <div>
          <p>✅ LINE 帳號已連接</p>
          {/* 可擴充註冊表單 */}
        </div>
      )} */}
    </div>
  );
}
