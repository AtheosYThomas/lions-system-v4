import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Button } from "../components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await axios.get('/admin/summary');
        setStats(response.data);
      } catch (error) {
        console.error('載入統計資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">🦁 管理後台總覽</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-100 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">總會員數</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.memberCount}</p>
          </div>

          <div className="bg-green-100 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">活躍會員</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeMembers}</p>
          </div>

          <div className="bg-purple-100 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">報名總數</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.registrationCount}</p>
          </div>

          <div className="bg-orange-100 p-6 rounded-lg border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">活動總數</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.eventCount}</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <Button variant="outline" size="lg">
          查看詳細報表
        </Button>
      </div>
    </div>
  );
}