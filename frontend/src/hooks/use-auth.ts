import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

export function useAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, isAuthenticated, login, register, logout, setUser } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
      toast.success('Login successful');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error('Login failed', error.response?.data?.message || 'Invalid credentials');
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      await register({ email, password, name });
      toast.success('Registration successful');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error('Registration failed', error.response?.data?.message || 'Please try again');
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    router.push('/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    setUser,
  };
}
