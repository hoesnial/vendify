import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("machine_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error("API Error Details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      },
    });
    return Promise.reject(error);
  }
);

export interface HealthAssistantResponse {
  success: boolean;
  message: string;
  isHealthRelated?: boolean;
  recommendedProducts?: Product[];
  timestamp?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  slot_id?: number;
  slot_number?: number;
  current_stock?: number;
  final_price?: number;
}

export interface OrderItem {
  slot_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Order {
  order_id: string;
  product_name?: string;
  quantity: number;
  unit_price?: number;
  total_amount: number;
  payment_url: string;
  payment_token: string;
  expires_at: string;
  qr_string: string;
  status: "PENDING" | "PAID" | "DISPENSING" | "COMPLETED" | "FAILED";
  paid_at?: string;
  dispensed_at?: string;
  items?: OrderItem[];
  total_quantity?: number;
}

export interface DispenseStatus {
  order_id: string;
  status: string;
  success?: boolean;
  drop_detected?: boolean;
  duration_ms?: number;
  error_message?: string;
}

// API functions
export const vendingAPI = {
  // Products
  getAvailableProducts: async (): Promise<{ products: Product[] }> => {
    const response = await api.get("/products/available");
    // Backend returns { success: true, data: [...], count: ... }
    // Transform to match expected format
    return {
      products: response.data.data || [],
    };
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Orders
  createOrder: async (orderData: {
    slot_id: number;
    quantity?: number;
    customer_phone?: string;
    payment_method?: "qris" | "va" | "gopay" | "shopeepay";
  }): Promise<Order> => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  createMultiItemOrder: async (orderData: {
    items: Array<{ slot_id: number; quantity: number }>;
    customer_phone?: string;
    payment_method?: "qris" | "va" | "gopay" | "shopeepay";
  }): Promise<Order> => {
    const response = await api.post("/orders/multi", orderData);
    return response.data;
  },

  getOrderStatus: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Payments
  verifyPayment: async (
    orderId: string,
    status: "SUCCESS" | "FAILED" = "SUCCESS"
  ) => {
    const response = await api.post(`/payments/verify/${orderId}`, { status });
    return response.data;
  },

  updatePaymentMethod: async (
    orderId: string,
    paymentMethod: "qris" | "va" | "gopay" | "shopeepay" | "midtrans"
  ) => {
    const response = await api.patch(`/payments/method/${orderId}`, {
      payment_method: paymentMethod,
    });
    return response.data;
  },

  // Dispense
  triggerDispense: async (orderId: string) => {
    const response = await api.post("/dispense/trigger", { order_id: orderId });
    return response.data;
  },

  getDispenseStatus: async (orderId: string): Promise<DispenseStatus> => {
    const response = await api.get(`/dispense/status/${orderId}`);
    return response.data;
  },

  // Machine
  getMachineInfo: async (machineId: string = "VM01") => {
    const response = await api.get(`/machines/${machineId}`);
    return response.data;
  },

  updateMachineStatus: async (machineId: string = "VM01", status: string) => {
    const response = await api.post(`/machines/${machineId}/status`, {
      status,
    });
    return response.data;
  },

  // Health Assistant
  chatWithAssistant: async (
    message: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<HealthAssistantResponse> => {
    const response = await api.post("/health-assistant/chat", {
      message,
      conversationHistory: conversationHistory || [],
    });
    return response.data;
  },

  getProductRecommendations: async (symptoms: string) => {
    const response = await api.post("/health-assistant/recommendations", {
      symptoms,
    });
    return response.data;
  },

  getAssistantStatus: async () => {
    const response = await api.get("/health-assistant/status");
    return response.data;
  },

  // Admin Authentication
  adminLogin: async (credentials: {
    username: string;
    password: string;
  }): Promise<{
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
    };
  }> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  adminLogout: () => {
    // Clear admin token from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("isAdminLoggedIn");
    }
  },

  // Stock Logs
  getStockLogs: async (
    machineId: string = "VM01",
    params?: {
      limit?: number;
      offset?: number;
      change_type?: string;
    }
  ) => {
    const response = await api.get(`/stock/logs/${machineId}`, { params });
    return response.data;
  },

  // Orders by Machine
  getOrdersByMachine: async (
    machineId: string = "VM01",
    params?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ) => {
    const response = await api.get(`/orders/machine/${machineId}`, { params });
    return response.data;
  },

  // Users Management (Admin only)
  getAllUsers: async (): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      name: string;
      email: string;
      phone?: string;
      role: string;
      status: string;
      createdAt: string;
      lastLogin?: string;
    }>;
    total: number;
  }> => {
    // Use admin token instead of machine token
    const adminToken = typeof window !== "undefined" 
      ? localStorage.getItem("adminToken") 
      : null;
    
    const response = await api.get("/users/all", {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    return response.data;
  },
};

export default api;
