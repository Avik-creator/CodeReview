import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface LogoutInterface {
  children: React.ReactNode;
  className?: string;
}

const LogOut = ({ children, className }: LogoutInterface) => {
  const router = useRouter();
  return (
    <span
      className={className}
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push('/');
            },
          },
        })
      }
    >
      {children}
    </span>
  );
};

export default LogOut;
