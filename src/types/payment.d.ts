
export interface Payment {
  id: number;
  registrationId: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate: Date;
  dueDate?: Date;
  description?: string;
  metadata?: Record<string, any>;
  processedBy?: number;
  createdAt: Date;
  updatedAt: Date;

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

export interface CreatePaymentRequest {
  registrationId: number;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  dueDate?: Date;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentRequest {
  amount?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  transactionId?: string;
  paymentDate?: Date;
  description?: string;
  metadata?: Record<string, any>;
  processedBy?: number;
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
  registrationId?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  amountMin?: number;
  amountMax?: number;
  paymentDateFrom?: Date;
  paymentDateTo?: Date;
  processedBy?: number;
  limit?: number;
  offset?: number;
}

export interface PaymentSummary {
  eventId: number;
  eventTitle: string;
  totalDue: number;
  totalPaid: number;
  totalPending: number;
  collectionRate: number;
}
