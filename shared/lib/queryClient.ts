import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text: string = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<TRequestData = unknown, TResponseData = unknown>(
  method: string,
  url: string,
  data?: TRequestData,
): Promise<Response> {
  const res: Response = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export async function apiRequestWithJson<TRequestData = unknown, TResponseData = unknown>(
  method: string,
  url: string,
  data?: TRequestData,
): Promise<TResponseData> {
  const res: Response = await apiRequest<TRequestData, TResponseData>(method, url, data);
  return await res.json() as TResponseData;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <TData>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<TData> => {
  return async ({ queryKey }): Promise<TData> => {
    const res: Response = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      return null as unknown as TData; // Null cast as TData to satisfy the QueryFunction type
    }

    await throwIfResNotOk(res);
    return await res.json() as TData;
  };
};

export const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn<unknown>({ on401: "throw" }),
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
