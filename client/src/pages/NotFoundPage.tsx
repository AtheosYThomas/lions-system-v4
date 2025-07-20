import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#dc2626',
          marginBottom: '1rem',
        }}
      >
        404 - 找不到頁面
      </h1>

      <p
        style={{
          marginTop: '1rem',
          color: '#6b7280',
          fontSize: '1.1rem',
        }}
      >
        請確認網址是否正確
      </p>

      <div style={{ marginTop: '2rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
            marginRight: '1rem',
          }}
        >
          回到首頁
        </Link>

        <Link
          to="/register"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: '500',
          }}
        >
          會員註冊
        </Link>
      </div>

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.5rem',
          border: '1px solid #d1d5db',
        }}
      >
        <p
          style={{
            fontSize: '0.9rem',
            color: '#4b5563',
            margin: 0,
          }}
        >
          🦁 北大獅子會系統 - 如需協助請聯絡系統管理員
        </p>
      </div>
    </div>
  );
}
