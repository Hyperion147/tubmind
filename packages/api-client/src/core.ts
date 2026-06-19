import type { z } from "zod/v4";

export type RequestFunction = <TData>(
  path: string,
  init: RequestInit | undefined,
  schema: z.ZodType<TData>,
  fallbackErrorMessage: string,
) => Promise<TData>;

async function requestWithSchema<TData>(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  schema: z.ZodType<TData>,
  fallbackErrorMessage: string,
) {
  const response = await fetch(input, init);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? fallbackErrorMessage);
  }

  return schema.parse(payload?.data);
}

export function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function createRequest(baseUrl = ""): RequestFunction {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  return (path, init, schema, fallbackErrorMessage) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return requestWithSchema(
      `${normalizedBaseUrl}${normalizedPath}`,
      init,
      schema,
      fallbackErrorMessage,
    );
  };
}
