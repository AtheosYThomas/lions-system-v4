
import QRCode from 'qrcode';

export async function generateQRCode(eventId: string, baseUrl: string = 'https://your-domain.replit.app'): Promise<string> {
  try {
    const checkinUrl = `${baseUrl}/checkin/${eventId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(checkinUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR Code 生成失敗:', error);
    throw new Error('QR Code 生成失敗');
  }
}

export async function generateQRCodeBuffer(eventId: string, baseUrl: string = 'https://your-domain.replit.app'): Promise<Buffer> {
  try {
    const checkinUrl = `${baseUrl}/checkin/${eventId}`;
    const qrCodeBuffer = await QRCode.toBuffer(checkinUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeBuffer;
  } catch (error) {
    console.error('QR Code Buffer 生成失敗:', error);
    throw new Error('QR Code Buffer 生成失敗');
  }
}
