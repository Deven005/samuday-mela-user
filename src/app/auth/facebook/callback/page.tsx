import FacebookWithCustomTokenAuth from '@/app/components/Auth/facebook/FacebookWithCustomTokenAuth';
import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

export default async function FacebookContinuePage() {
  const cookieStore = await cookies();
  const fb_custom_token = cookieStore.get('fb_custom_token')?.value;

  if (!fb_custom_token) {
    redirect('/', RedirectType.replace);
    // return <div>No Data</div>;
  }

  return <FacebookWithCustomTokenAuth fb_custom_token={fb_custom_token} />;
}
