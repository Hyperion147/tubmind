export async function apiRequest<TData>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fallbackErrorMessage = "Request failed",
) {
  const response = await fetch(input, init);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? fallbackErrorMessage);
  }

  return payload?.data as TData;
}

export function createApiClient(baseUrl: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  return {
    request<TData>(
      path: string,
      init?: RequestInit,
      fallbackErrorMessage?: string,
    ) {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;

      return apiRequest<TData>(
        `${normalizedBaseUrl}${normalizedPath}`,
        init,
        fallbackErrorMessage,
      );
    },
  };
}
