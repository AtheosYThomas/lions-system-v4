
export interface Payment {
  id: number;
  registration_id: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  payment_date: Date;
  due_date?: Date;
  description?: string;
  metadata?: Record<string, any>;
  processed_by?: string;
  created_at: Date;
  updated_at: Date;

  // 關聯資料
  registration?: import('./registration').Registration;
  processor?: import('./member').Member;
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  LINE_PAY = 'line_pay',
  OTHER = 'other'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface PaymentProvider {
  id: string;
  name: string;
  type: PaymentMethod;
  config: Record<string, any>;
  isActive: boolean;
}

export interface CreatePaymentRequest {
  registration_id: number;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  due_date?: Date;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentRequest {
  amount?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  transaction_id?: string;
  payment_date?: Date;
  description?: string;
  metadata?: Record<string, any>;
  processed_by?: string;
}
