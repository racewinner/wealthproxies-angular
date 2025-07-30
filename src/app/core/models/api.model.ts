export interface ProductVariant {
  id: string;
  productId: string;
  isActive: boolean;
  name: string;
  price: number;
  bandwidthGb: number;
  stripeProductId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  productType: 'residential' | 'isp' | 'server' | 'proxy_list';
  provider: string;
  whatsIncluded: string[];
  color: 'blue' | 'green' | 'gray';
  polygon: 'triangle' | 'circle' | 'square' | 'star';
  isActive: boolean;
  minimumQuantity: number;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export interface Plan {
  id: string;
  productId: string;
  userId: string;
  name: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  bandwidth: number;
  bandwidthUsed: number;
  price: number;
}

export interface DailyRecord {
  [date: string]: {
    consumed: number;
    remaining: number;
  };
}

export interface MonthlyRecord {
  [month: string]: {
    consumedBandwidth: number;
    remainingBandwidth: number;
  };
}

export interface UserBandwidthAccountInfo {
  trafficConsumed: number;
  trafficConsumedString: string;
  trafficBalance: number;
  trafficBalanceString: string;
}

export interface UserBandwidthInfo {
  dailyRecords: DailyRecord;
  monthlyRecords: MonthlyRecord;
  accountInfo: UserBandwidthAccountInfo;
}

export interface MonthUsage {
  month: string;
  usage: number;
}

// Billing and Subscription Models
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_account';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  variantId: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  nextBillingDate?: Date;
  amount: number;
  currency: string;
  paymentMethodId: string;
  product: Product;
  variant: ProductVariant;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  variantId: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  amount: number;
  currency: string;
  quantity: number;
  paymentMethodId?: string;
  receiptUrl?: string;
  product: Product;
  variant: ProductVariant;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingInfo {
  subscriptions: Subscription[];
  paymentMethods: PaymentMethod[];
  totalSpent: number;
  activeSubscriptions: number;
}

// Order Creation Models
export interface OrderItemRequest {
  variant_id: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
}

export interface CreateOrderResponse {
  url: string;
}

// Paginated Orders Response
export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  size: number;
}
