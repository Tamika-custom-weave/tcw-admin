import { OrderData } from "@/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface FetchApiOptions extends RequestInit {
  /** If true, a 401 response will NOT trigger a global redirect to /login.
   *  Use this for the login endpoint itself so errors can be surfaced to the user. */
  skipAuthRedirect?: boolean;
}

export async function fetchApi<T>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
  const { skipAuthRedirect, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(fetchOptions.headers || {});
  
  // Only set application/json if we are not sending FormData
  if (!(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (_e) {
      // Ignored if not JSON
    }

    // Only redirect to login on 401 if we're NOT on the login endpoint itself,
    // so that wrong PINs can display an error message instead of causing a redirect loop.
    if (response.status === 401 && !skipAuthRedirect && typeof window !== 'undefined') {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
    
    throw new Error(errorMessage);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  const json = await response.json();
  
  // If the backend wraps the response in a { success: true, data: ... } object, unwrap it
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  
  return json as T;
}

export async function getOrders() {
  return fetchApi<OrderData[]>('/orders', { cache: 'no-store' });
}

export async function updateOrderStatus(orderId: string, status: string) {
  return fetchApi<OrderData>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
