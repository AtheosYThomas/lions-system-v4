
import React, { useEffect, useState } from 'react';
import liff from '@line/liff';

export default function Register() {
  const [lineId, setLineId] = useState('');

  useEffect(() => {
    liff.init({ liffId: import.meta.env.VITE_LIFF_ID }).then(() => {
      if (liff.isLoggedIn()) {
        liff.getProfile().then(profile => {
          setLineId(profile.userId);
        });
      } else {
        liff.login();
      }
    });
  }, []);

  return (
    <div>
      <h2>活動報名</h2>
      <p>LINE UID: {lineId}</p>
      {/* 可擴充表單送出 */}
    </div>
  );
}
