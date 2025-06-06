'use server';
import { createCommunity } from '@/app/utils/communities/communities';
import { redirect } from 'next/navigation';

export async function createCommunityAction(formData: FormData) {
  try {
    const slug = await createCommunity(formData);
    console.log('createCommunityAction: ', slug);

    // Redirect to the new community page (SSR redirect)
    redirect(`/communities/${slug}`);
  } catch (error) {
    // alert(error ?? 'Something is wrong!');
    console.log('createCommunityAction err: ', error);
  }
}
