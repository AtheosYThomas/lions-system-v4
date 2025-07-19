
import React, { useState, useEffect } from 'react';

// LIFF 類型定義
declare global {
  interface Window {
    liff: any;
  }
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  english_name: string;
  birthday: string;
  job_title: string;
  mobile: string;
  address: string;
}

const Register: React.FC = () => {
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [liffInitialized, setLiffInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    english_name: '',
    birthday: '',
    job_title: '',
    mobile: '',
    address: ''
  });

  useEffect(() => {
    const initLiff = async () => {
      try {
        // 動態載入 LIFF SDK
        if (!document.getElementById('liff-sdk')) {
          const script = document.createElement('script');
          script.id = 'liff-sdk';
          script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
          script.onload = async () => {
            await initializeLiff();
          };
          document.head.appendChild(script);
        } else {
          await initializeLiff();
        }
      } catch (error) {
        console.error('LIFF 初始化失敗:', error);
      }
    };

    const initializeLiff = async () => {
      try {
        // 取得 LIFF 配置
        const configResponse = await fetch('/api/liff/config');
        const config = await configResponse.json();
        
        if (!config.success || !config.liff_id) {
          throw new Error('無法取得 LIFF 配置');
        }

        await window.liff.init({ liffId: config.liff_id });
        
        if (!window.liff.isLoggedIn()) {
          window.liff.login();
          return;
        }

        const profile = await window.liff.getProfile();
        const context = window.liff.getContext();
        
        setLineUserId(context?.userId || profile?.userId || null);
        setLiffInitialized(true);
        
        // 自動填入 LINE 用戶資料
        if (profile) {
          setFormData(prev => ({
            ...prev,
            name: profile.displayName || prev.name
          }));
        }
        
      } catch (error) {
        console.error('LIFF 初始化錯誤:', error);
        alert('LIFF 初始化失敗，請重新整理頁面');
      }
    };

    initLiff();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lineUserId) {
      alert('尚未擷取 LINE 用戶資訊，請重新整理頁面');
      return;
    }

    // 驗證必填欄位
    const requiredFields = ['name', 'email', 'birthday', 'job_title', 'mobile', 'address'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (missingFields.length > 0) {
      alert(`請填寫必填欄位: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/liff/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          line_user_id: lineUserId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('註冊成功！將導向報到頁面');
        window.location.href = '/checkin';
      } else {
        alert(`註冊失敗：${result.error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      alert('註冊過程發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (!liffInitialized) {
    return (
      <div className="register-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>正在初始化 LIFF...</h2>
        <p>請稍候，系統正在載入中</p>
      </div>
    );
  }

  return (
    <div className="register-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ color: '#2563eb', marginBottom: '1.5rem', textAlign: 'center' }}>
        🦁 北大獅子會會員註冊
      </h2>
      
      {lineUserId && (
        <div style={{ 
          backgroundColor: '#f0f9ff', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          border: '1px solid #0ea5e9'
        }}>
          ✅ LINE 用戶驗證成功
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="name" style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
            姓名 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
            Email <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="english_name" style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
            英文姓名
          </label>
          <input
            type="text"
            id="english_name"
            name="english_name"
            value={formData.english_name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthday" style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
            生日 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="job_title" style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
            職稱 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            id="job_title"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobile" style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
            手機 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
            電話
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address" style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
            地址 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !lineUserId}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: loading || !lineUserId ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading || !lineUserId ? 'not-allowed' : 'pointer',
            marginTop: '1rem'
          }}
        >
          {loading ? '註冊中...' : '送出註冊'}
        </button>
      </form>

      <div style={{ 
        marginTop: '2rem', 
        textAlign: 'center', 
        fontSize: '0.875rem', 
        color: '#6b7280' 
      }}>
        <p>註冊完成後將自動導向報到頁面</p>
      </div>
    </div>
  );
};

export default Register;
