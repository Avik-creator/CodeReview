import LogOut from '@/components/auth/components/logOut';
import { Button } from '@/components/ui/button';
import { requireAuth } from '@/lib/auth/utils';
import Image from 'next/image';

export default async function Home(): Promise<React.ReactElement> {
  await requireAuth();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <LogOut>
        <Button>Logout</Button>
      </LogOut>
    </div>
  );
}
