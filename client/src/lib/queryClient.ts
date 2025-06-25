// lib/queryClient.ts - Updated to match your existing structure
import { QueryClient, QueryFunction } from "@tanstack/react-query";

const BASE_URL = 'https://inovaqofinance-be-production.up.railway.app';

// Get auth token from localStorage
function getAuthToken(): string | null {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).token : null;
  } catch {
    return null;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = getAuthToken();
  const fullUrl = url.startsWith('/api') ? `${BASE_URL}${url}` : url;
  
  const headers: Record<string, string> = {
    ...(data && { "Content-Type": "application/json" } as Record<string, string>),
    ...(token && { "Authorization": `Bearer ${token}` }),
  };

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle unauthorized responses
  if (res.status === 401) {
    localStorage.removeItem('user');
    // Trigger a page reload to redirect to login
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  await throwIfResNotOk(res);
  return res;
}

// Add a new function that handles JSON parsing
export async function apiRequestJson(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const token = getAuthToken();
  const fullUrl = url.startsWith('/api') ? `${BASE_URL}${url}` : url;
  
  const headers: Record<string, string> = {
    ...(data && { "Content-Type": "application/json" } as Record<string, string>),
    ...(token && { "Authorization": `Bearer ${token}` }),
  };

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    localStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  // Handle empty responses (common for delete operations)
  const contentLength = res.headers.get('content-length');
  if (contentLength === '0' || res.status === 204) {
    return { success: true };
  }

  // Handle non-JSON responses
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    return { message: text || 'Success' };
  }

  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = getAuthToken();
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('/api') ? `${BASE_URL}${url}` : url;
    
    const headers: Record<string, string> = {
      ...(token && { "Authorization": `Bearer ${token}` }),
    };

    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (res.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Unauthorized');
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});