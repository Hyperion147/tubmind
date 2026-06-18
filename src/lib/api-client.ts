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
