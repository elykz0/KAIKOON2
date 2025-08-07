import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useSetupFlow } from './useSetupFlow';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { needsSetup, isLoadingSettings } = useSetupFlow();

  const redirectAfterAuth = () => {
    // Don't redirect while still loading
    if (isLoadingSettings || authState.type === 'loading') {
      return;
    }

    // If user is not authenticated, redirect to login
    if (authState.type === 'unauthenticated') {
      console.log('User not authenticated, redirecting to login page.');
      navigate('/login');
      return;
    }

    // If user needs setup, redirect to setup page
    if (needsSetup) {
      console.log('User needs setup, redirecting to setup page.');
      navigate('/setup');
      return;
    }

    // Otherwise, redirect to dashboard
    console.log('User setup complete, redirecting to dashboard.');
    navigate('/dashboard');
  };

  return { redirectAfterAuth, needsSetup, isLoadingSettings };
};
