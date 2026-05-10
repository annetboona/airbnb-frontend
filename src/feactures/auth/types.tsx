
export type UserRole = "guest" | "host" | "admin";


export type RegistrationRole = Exclude<UserRole, "admin">;

export interface RegistrationInput {
  name: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  role: RegistrationRole;
}


export interface LoginInput {
  email: string;
  password: string;
}


export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}


export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  role: UserRole | null;
  email: string | null;
  name: string | null;
  username: string | null;
  phone: string | null;
}


export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegistrationInput) => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  logout: () => void;
}
