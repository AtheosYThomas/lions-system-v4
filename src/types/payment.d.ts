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
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
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

export interface PaymentStats {
  total: number;
  byMethod: Record<PaymentMethod, number>;
  byStatus: Record<PaymentStatus, number>;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  averagePaymentTime: number;
}

export interface PaymentSearchParams {
  registration_id?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  amount_min?: number;
  amount_max?: number;
  payment_date_from?: Date;
  payment_date_to?: Date;
  processed_by?: string;
  limit?: number;
  offset?: number;
}

export interface PaymentSummary {
  event_id: number;
  event_title: string;
  total_due: number;
  total_paid: number;
  total_pending: number;
  collection_rate: number;
}
