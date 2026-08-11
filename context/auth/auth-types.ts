export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  accountType: string;
  userName: string;
  tenantId: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  companyLogo: string;
  user: UserData | null;
  authLoading: boolean
  login: (token: string, refreshToken?: string) => void;
  logout: () => void;
  setReady: React.Dispatch<React.SetStateAction<boolean>>;
  ready: boolean;
}