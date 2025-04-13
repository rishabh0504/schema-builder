import { useState, useEffect, useCallback } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface UseFetchOptions {
  headers?: Record<string, string>;
}

interface UseFetchReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
  get: (url?: string, options?: UseFetchOptions) => void;
  post: <P = any>(url: string, payload: P, options?: UseFetchOptions) => void;
  put: <P = any>(url: string, payload: P, options?: UseFetchOptions) => void;
  patch: <P = any>(url: string, payload: P, options?: UseFetchOptions) => void;
  del: (url: string, options?: UseFetchOptions) => void;
}

export function useFetch<T = any>(
  baseUrl: string,
  defaultOptions: UseFetchOptions = {},
  immediate: boolean = false
): UseFetchReturn<T> {
  const [url, setUrl] = useState(baseUrl);
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [body, setBody] = useState<any>(null);
  const [customOptions, setCustomOptions] = useState<UseFetchOptions>({});
  const [shouldFetch, setShouldFetch] = useState(immediate);

  const [loading, setLoading] = useState(immediate);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...defaultOptions.headers,
          ...customOptions.headers,
        },
      };

      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      const contentType = response.headers.get("content-type");

      const result = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error((result as any)?.message || response.statusText);
      }

      setData(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setShouldFetch(false);
    }
  }, [url, method, body, customOptions, defaultOptions]);

  useEffect(() => {
    if (shouldFetch) {
      fetchData();
    }
  }, [fetchData, shouldFetch]);

  const refetch = () => setShouldFetch(true);

  const get = (customUrl: string = baseUrl, options: UseFetchOptions = {}) => {
    setUrl(customUrl);
    setMethod("GET");
    setCustomOptions(options);
    setBody(null);
    setShouldFetch(true);
  };

  const post = <P = any>(
    customUrl: string,
    payload: P,
    options: UseFetchOptions = {}
  ) => {
    setUrl(customUrl);
    setMethod("POST");
    setBody(payload);
    setCustomOptions(options);
    setShouldFetch(true);
  };

  const put = <P = any>(
    customUrl: string,
    payload: P,
    options: UseFetchOptions = {}
  ) => {
    setUrl(customUrl);
    setMethod("PUT");
    setBody(payload);
    setCustomOptions(options);
    setShouldFetch(true);
  };

  const patch = <P = any>(
    customUrl: string,
    payload: P,
    options: UseFetchOptions = {}
  ) => {
    setUrl(customUrl);
    setMethod("PATCH");
    setBody(payload);
    setCustomOptions(options);
    setShouldFetch(true);
  };

  const del = (customUrl: string, options: UseFetchOptions = {}) => {
    setUrl(customUrl);
    setMethod("DELETE");
    setCustomOptions(options);
    setBody(null);
    setShouldFetch(true);
  };

  return {
    data,
    error,
    loading,
    refetch,
    get,
    post,
    put,
    patch,
    del,
  };
}
