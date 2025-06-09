// API service layer for communicating with the backend
const API_BASE_URL = 'http://localhost:3001/api/v1';

interface VendorData {
  companyId: string;
  companyName: string;
  vendorUserId?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  bankName?: string;
  routingNumber?: string;
  accountNumber?: string;
  accountType?: string;
}

interface VendorFilters {
  companyId?: string;
  status?: string;
  vendorUserId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

interface VendorResponse {
  id: string;
  company_id: string;
  company_name: string;
  vendor_user_id: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'active' | null;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string | null;
  website: string | null;
  tax_id: string | null;
  bank_name: string | null;
  routing_number: string | null;
  account_type: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  approver_user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface VendorsListResponse {
  vendors: VendorResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to make authenticated requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // TODO: Add authentication headers when auth is implemented
  // const token = getAuthToken();
  // if (token) {
  //   defaultHeaders['Authorization'] = `Bearer ${token}`;
  // }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'API request failed');
    }

    if (!data.success) {
      throw new ApiError(400, data.message || 'Request failed');
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Vendor API methods
export const vendorApi = {
  // Get all vendors with filtering
  getVendors: async (filters: VendorFilters = {}): Promise<VendorsListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.companyId) params.append('companyId', filters.companyId);
    if (filters.status) params.append('status', filters.status);
    if (filters.vendorUserId) params.append('vendorUserId', filters.vendorUserId);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/vendors?${queryString}` : '/vendors';
    
    return apiRequest<VendorsListResponse>(endpoint);
  },

  // Get vendor by ID
  getVendor: async (id: string): Promise<VendorResponse> => {
    return apiRequest<VendorResponse>(`/vendors/${id}`);
  },

  // Create new vendor
  createVendor: async (vendorData: VendorData): Promise<VendorResponse> => {
    return apiRequest<VendorResponse>('/vendors', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  },

  // Update vendor
  updateVendor: async (id: string, vendorData: Partial<VendorData>): Promise<VendorResponse> => {
    return apiRequest<VendorResponse>(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vendorData),
    });
  },

  // Submit vendor for approval
  submitVendor: async (id: string): Promise<VendorResponse> => {
    return apiRequest<VendorResponse>(`/vendors/${id}/submit`, {
      method: 'PATCH',
    });
  },

  // Approve vendor
  approveVendor: async (id: string): Promise<VendorResponse> => {
    return apiRequest<VendorResponse>(`/vendors/${id}/approve`, {
      method: 'PATCH',
    });
  },

  // Reject vendor
  rejectVendor: async (id: string, reason?: string): Promise<VendorResponse> => {
    return apiRequest<VendorResponse>(`/vendors/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  // Activate vendor
  activateVendor: async (id: string): Promise<VendorResponse> => {
    return apiRequest<VendorResponse>(`/vendors/${id}/activate`, {
      method: 'PATCH',
    });
  },

  // Delete vendor
  deleteVendor: async (id: string): Promise<void> => {
    return apiRequest<void>(`/vendors/${id}`, {
      method: 'DELETE',
    });
  },

  // Get pending approvals
  getPendingApprovals: async (): Promise<VendorResponse[]> => {
    return apiRequest<VendorResponse[]>('/vendors/pending');
  },
};

export { ApiError };
export type { VendorData, VendorResponse, VendorsListResponse, VendorFilters };

export class ApiService {
  private static instance: ApiService;
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://localhost:3001/api/v1';
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Authentication methods
  async signup(email: string, password: string, fullName: string, role: string = 'vendor') {
    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        fullName,
        role
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Signup failed');
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Login failed');
    }

    return response.json();
  }

  async logout(token: string) {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Logout failed');
    }

    return response.json();
  }

  async getProfile(token: string) {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Failed to get profile');
    }

    return response.json();
  }

  async refreshToken(refreshToken: string) {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.message || 'Token refresh failed');
    }

    return response.json();
  }

  // ... existing vendor methods ...
} 