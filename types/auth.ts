export interface AdminRegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    name: string;
  };
  error?: string;
}
