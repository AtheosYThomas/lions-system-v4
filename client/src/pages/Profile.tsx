import React, { useEffect, useState } from 'react';
import liff from '@line/liff';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  created_at: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeLiff();
  }, []);

  const initializeLiff = async () => {
    try {
      await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });
      
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const lineProfile = await liff.getProfile();
      await fetchMemberProfile(lineProfile.userId);
      
    } catch (err) {
      console.error('LIFF 初始化錯誤:', err);
      setError('無法連接到 LINE 服務');
      setLoading(false);
    }
  };

  const fetchMemberProfile = async (lineUid: string) => {
    try {
      const response = await fetch(`/liff/profile/${lineUid}`);
      const result = await response.json();

      if (result.success) {
        setProfile(result.member);
      } else {
        setError('未找到會員資料，請先完成註冊');
      }
    } catch (err) {
      console.error('獲取會員資料錯誤:', err);
      setError('無法獲取會員資料');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <h2>🔍 正在載入會員資料...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>❌ {error}</h2>
          <button 
            onClick={() => window.location.href = '/register'}
            style={styles.button}
          >
            前往註冊
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>👤 會員資料管理</h1>
      <p>查看並更新您的會員資料</p>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>個人資料</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label><strong>姓名：</strong></label>
            <input type="text" placeholder="請輸入姓名" style={{ marginLeft: '10px', padding: '5px' }} />
          </div>
          <div>
            <label><strong>英文姓名：</strong></label>
            <input type="text" placeholder="請輸入英文姓名" style={{ marginLeft: '10px', padding: '5px' }} />
          </div>
          <div>
            <label><strong>電子郵件：</strong></label>
            <input type="email" placeholder="請輸入電子郵件" style={{ marginLeft: '10px', padding: '5px' }} />
          </div>
          <div>
            <label><strong>手機號碼：</strong></label>
            <input type="tel" placeholder="請輸入手機號碼" style={{ marginLeft: '10px', padding: '5px' }} />
          </div>
          <div>
            <label><strong>生日：</strong></label>
            <input type="date" style={{ marginLeft: '10px', padding: '5px' }} />
          </div>
          <div>
            <label><strong>職業：</strong></label>
            <input type="text" placeholder="請輸入職業" style={{ marginLeft: '10px', padding: '5px' }} />
          </div>
          <div>
            <label><strong>地址：</strong></label>
            <textarea placeholder="請輸入地址" style={{ marginLeft: '10px', padding: '5px', width: '300px', height: '60px' }}></textarea>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}>
            更新資料
          </button>
          <button style={{
            backgroundColor: '#6c757d',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            取消
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          返回首頁
        </a>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
    color: '#333'
  },
  loading: {
    textAlign: 'center' as const,
    color: '#666',
    marginTop: '3rem'
  },
  error: {
    textAlign: 'center' as const,
    color: '#dc2626',
    marginTop: '3rem'
  },
  profileCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1.5rem',
    marginBottom: '2rem'
  },
  field: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#374151',
    marginBottom: '0.5rem'
  },
  value: {
    fontSize: '16px',
    color: '#111827',
    padding: '0.5rem',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '6px'
  },
  status: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold' as const
  },
  actions: {
    textAlign: 'center' as const
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  backButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};