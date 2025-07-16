
import React, { useState } from 'react';
import axios from '../api/axios';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface MemberFormData {
  name: string;
  phone: string;
  email: string;
  lineUserId?: string;
}

export default function MemberForm() {
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    phone: '',
    email: '',
    lineUserId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/members', formData);
      setMessage('✅ 會員資料已成功提交！');
      setFormData({ name: '', phone: '', email: '', lineUserId: '' });
    } catch (error) {
      setMessage('❌ 提交失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-xl bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">🦁 北大獅子會報名表單</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg text-center ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="請輸入您的姓名"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">電話 *</label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="請輸入電話號碼"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">電子郵件 *</label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="請輸入電子郵件"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LINE ID（選填）</label>
          <Input
            type="text"
            name="lineUserId"
            value={formData.lineUserId}
            onChange={handleChange}
            placeholder="請輸入您的 LINE ID"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          variant={isSubmitting ? "secondary" : "default"}
        >
          {isSubmitting ? '提交中...' : '提交報名'}
        </Button>
      </form>
    </div>
  );
}
