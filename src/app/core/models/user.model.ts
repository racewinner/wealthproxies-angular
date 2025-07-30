export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  image?: string;
  role: 'user' | 'admin';
  discordId?: string;
  discordUsername?: string;
  totalSpent?: number;
  lastPurchase?: Date;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
  token?: string; // Optional JWT token if backend provides it
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

// User Management Interfaces
export interface UserProviderAccount {
  id: string;
  userId: string;
  provider: string;
  accountId: string;
  accountName?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  credentials?: any; // Provider-specific credentials
  settings?: any; // Provider-specific settings
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProviderAccountStatus {
  provider: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastChecked: Date;
  details?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  image?: string;
  role: 'user' | 'admin';
  discordId?: string;
  discordUsername?: string;
  stripeCustomerId?: string;
  totalSpent?: number;
  lastPurchase?: Date;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Additional profile fields
  phone?: string;
  address?: string;
  company?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
}

export interface UserBandwidthData {
  totalBandwidth: number;
  usedBandwidth: number;
  remainingBandwidth: number;
  resetDate: Date;
}

export interface UserOrderData {
  orders: any[]; // Will use Order interface from api.model.ts
  totalOrders: number;
  totalSpent: number;
}

export interface UserSubscriptionData {
  subscriptions: any[]; // Will use Subscription interface from api.model.ts
  activeSubscriptions: number;
  totalSubscriptions: number;
}
