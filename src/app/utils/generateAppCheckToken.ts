import { getToken } from 'firebase/app-check';
import { appCheck, auth } from '../config/firebase.config';

// ✅ Function to retrieve Firebase App Check token globally
export async function getAppCheckToken(): Promise<string | null> {
  try {
    const token = await getToken(appCheck, false);
    return token?.token || null;
  } catch (error) {
    console.error('Error fetching App Check token:', error);
    throw error;
  }
}

export async function fetchWithAppCheck(
  url: string,
  userIdToken: string,
  options: RequestInit = {},
) {
  try {
    // const token = await getAppCheckToken(); // ✅ Fetch App Check token globally

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${userIdToken}`);

    // if (token) {
    // headers.set('X-Firebase-AppCheck', token); // ✅ Attach App Check token to request headers
    // }

    // ✅ Dynamically determine base origin (client-side only)
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    if (!origin) {
      throw new Error('Origin not available. This function must be used client-side.');
    }

    const response = await fetch(`${origin}${url}`, {
      ...options,
      headers,
    });

    // if (!response.ok) {
    //   throw new Error(`HTTP Error: ${response.status} with ${response.statusText}`);
    // }

    return response.json();
  } catch (error) {
    console.error('Error in Fetch with App Check:', error);
    throw error;
  }
}
