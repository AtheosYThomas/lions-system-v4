import React, { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  lineId: string;
  joinDate: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 實作從 API 載入用戶資料
    const loadProfile = async () => {
      try {
        // 模擬 API 調用
        const mockProfile: UserProfile = {
          id: '1',
          name: '張三',
          email: 'zhang@example.com',
          phone: '0912345678',
          lineId: 'zhang123',
          joinDate: '2024-01-01',
        };
        setProfile(mockProfile);
      } catch (error) {
        console.error('載入用戶資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <div>載入中...</div>;
  }

  if (!profile) {
    return <div>無法載入用戶資料</div>;
  }

  return (
    <div className="profile-container">
      <h2>個人資料</h2>
      <div className="profile-info">
        <div className="info-item">
          <label>姓名:</label>
          <span>{profile.name}</span>
        </div>
        <div className="info-item">
          <label>Email:</label>
          <span>{profile.email}</span>
        </div>
        <div className="info-item">
          <label>電話:</label>
          <span>{profile.phone}</span>
        </div>
        <div className="info-item">
          <label>LINE ID:</label>
          <span>{profile.lineId}</span>
        </div>
        <div className="info-item">
          <label>加入日期:</label>
          <span>{profile.joinDate}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
