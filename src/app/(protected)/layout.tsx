import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If the user is not authenticated, redirect to the login page
  if (!session) {
    console.log('Not authenticated');
    // redirect('/');
    return null; // Sementara hanya kembalikan null, sesuaikan dengan logika redirect Anda
  }

  return (
    <Page>
      {children}
    </Page>
  );
}