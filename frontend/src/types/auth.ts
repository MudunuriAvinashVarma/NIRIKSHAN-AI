export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department?: string;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  confirm_password?: string;
}

export interface AuthResponse {
  status: "success" | "error";
  message?: string;
  user?: User;
  detail?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

