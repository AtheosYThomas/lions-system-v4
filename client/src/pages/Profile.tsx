
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>👤 會員資料</h1>
      </div>
      
      {profile && (
        <div style={styles.profileCard}>
          <div style={styles.field}>
            <label style={styles.label}>姓名</label>
            <div style={styles.value}>{profile.name}</div>
          </div>
          
          <div style={styles.field}>
            <label style={styles.label}>電子郵件</label>
            <div style={styles.value}>{profile.email}</div>
          </div>
          
          {profile.phone && (
            <div style={styles.field}>
              <label style={styles.label}>電話</label>
              <div style={styles.value}>{profile.phone}</div>
            </div>
          )}
          
          <div style={styles.field}>
            <label style={styles.label}>會員等級</label>
            <div style={styles.value}>{profile.role}</div>
          </div>
          
          <div style={styles.field}>
            <label style={styles.label}>狀態</label>
            <div style={styles.value}>
              <span style={{
                ...styles.status,
                backgroundColor: profile.status === 'active' ? '#10b981' : '#f59e0b'
              }}>
                {profile.status === 'active' ? '啟用中' : '暫停'}
              </span>
            </div>
          </div>
          
          <div style={styles.field}>
            <label style={styles.label}>加入日期</label>
            <div style={styles.value}>
              {new Date(profile.created_at).toLocaleDateString('zh-TW')}
            </div>
          </div>
        </div>
      )}
      
      <div style={styles.actions}>
        <button 
          onClick={() => window.history.back()}
          style={styles.backButton}
        >
          ← 返回
        </button>
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
