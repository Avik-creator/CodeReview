import LoginUI from '@/components/auth/components/loginUi';
import { requireUnAuth } from '@/lib/auth/utils';

const LoginPage = async () => {
  await requireUnAuth();
  return <LoginUI />;
};

export default LoginPage;
