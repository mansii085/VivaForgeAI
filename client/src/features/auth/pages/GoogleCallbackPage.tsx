import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, setAccessToken } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');

      if (!token) {
        toast.error('Authentication failed: missing token');
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Set access token in memory first so request interceptor can use it
        setAccessToken(token);

        // Fetch user info
        const response = await api.get('/auth/me');
        const user = response.data.data;

        // Persist full auth state
        setAuth(user, token);
        toast.success('Successfully logged in with Google!');
        navigate('/dashboard', { replace: true });
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        toast.error('Failed to log in with Google');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, setAccessToken, setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <h3 className="text-xl font-bold font-display">Authorizing Google Account</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Please wait while we secure your session...
        </p>
      </div>
    </div>
  );
}
