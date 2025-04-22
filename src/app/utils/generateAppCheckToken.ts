import { getToken } from "firebase/app-check";
import { appCheck } from "../config/firebase.config";

// ✅ Function to retrieve Firebase App Check token globally
export async function getAppCheckToken(): Promise<string | null> {
  try {
    const token = await getToken(appCheck, true);
    return token?.token || null;
  } catch (error) {
    console.error("Error fetching App Check token:", error);
    throw error;
  }
}

export async function fetchWithAppCheck(
  url: string,
  options: RequestInit = {}
) {
  try {
    const token = await getAppCheckToken(); // ✅ Fetch App Check token globally

    const headers = new Headers(options.headers);
    if (token) {
      headers.set("Content-Type", "application/json");
      headers.set("X-Firebase-AppCheck", token); // ✅ Attach App Check token to request headers
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    console.log(`res ${url}: `, response);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error in Fetch with App Check:", error);
    throw error;
  }
}
