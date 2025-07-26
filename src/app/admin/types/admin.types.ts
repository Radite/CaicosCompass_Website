export interface AdminDashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  growthRate: number;
  recentBookings: Booking[];
  recentUsers: User[];
  platformMetrics: {
    activeVendors: number;
    pendingApprovals: number;
    totalListings: number;
    conversionRate: number;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'business-manager' | 'admin';
  isActive: boolean;
  loyaltyPoints: number;
  createdAt: string;
  lastLoginAt?: string;
  businessProfile?: {
    businessName: string;
    isApproved: boolean;
  };
}

export interface Booking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  vendor: {
    _id: string;
    name: string;
  };
  service: {
    _id: string;
    name: string;
  };
  serviceName: string;
  category: 'stays' | 'dining' | 'activities' | 'transportation';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  date: string;
  guests: number;
  paymentDetails: {
    totalAmount: number;
    amountPaid: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    paymentMethod: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  topVendors: Array<{
    vendorId: string;
    vendorName: string;
    revenue: number;
    bookings: number;
  }>;
}

export interface SystemMetrics {
  serverHealth: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: string;
  };
  databaseHealth: {
    connections: number;
    queryTime: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  apiMetrics: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface AdminFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  status: string;
  category: string;
  role: string;
}