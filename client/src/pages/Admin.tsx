
import React, { useEffect, useState } from 'react';

interface SystemSummary {
  memberCount: number;
  activeMembers: number;
  registrationCount: number;
  eventCount: number;
  timestamp: string;
}

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSystemSummary();
  }, []);

  const fetchSystemSummary = async () => {
    try {
      const response = await fetch('/admin/summary');
      const result = await response.json();

      if (response.ok) {
        setSummary(result);
      } else {
        setError('無法獲取系統統計資料');
      }
    } catch (err) {
      console.error('獲取系統統計錯誤:', err);
      setError('系統連接錯誤');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <h2>📊 正在載入系統統計...</h2>
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
            onClick={() => window.location.reload()}
            style={styles.button}
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📊 管理後台</h1>
        <p>北大獅子會系統統計概覽</p>
      </div>
      
      {summary && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statNumber}>{summary.memberCount}</div>
            <div style={styles.statLabel}>總會員數</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statNumber}>{summary.activeMembers}</div>
            <div style={styles.statLabel}>活躍會員</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📅</div>
            <div style={styles.statNumber}>{summary.eventCount}</div>
            <div style={styles.statLabel}>活動數量</div>
          </div>
          
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📝</div>
            <div style={styles.statNumber}>{summary.registrationCount}</div>
            <div style={styles.statLabel}>報名記錄</div>
          </div>
        </div>
      )}
      
      <div style={styles.info}>
        <p>最後更新時間: {summary ? new Date(summary.timestamp).toLocaleString('zh-TW') : ''}</p>
      </div>
      
      <div style={styles.actions}>
        <button 
          onClick={() => window.history.back()}
          style={styles.backButton}
        >
          ← 返回主頁
        </button>
        <button 
          onClick={() => window.location.reload()}
          style={styles.refreshButton}
        >
          🔄 重新整理
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1.5rem',
    textAlign: 'center' as const,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold' as const,
    color: '#3b82f6',
    marginBottom: '0.5rem'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 'bold' as const
  },
  info: {
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '2rem'
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem'
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  backButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  refreshButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};
