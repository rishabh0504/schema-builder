### useFetch

---

```
// hooks/useFetch.ts
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
  immediate = false
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
    if (shouldFetch) fetchData();
  }, [fetchData, shouldFetch]);

  const refetch = () => setShouldFetch(true);
  const get = (customUrl: string = baseUrl, options: UseFetchOptions = {}) => {
    setUrl(customUrl);
    setMethod("GET");
    setBody(null);
    setCustomOptions(options);
    setShouldFetch(true);
  };
  const post = <P = any>(customUrl: string, payload: P, options: UseFetchOptions = {}) => {
    setUrl(customUrl);
    setMethod("POST");
    setBody(payload);
    setCustomOptions(options);
    setShouldFetch(true);
  };
  const put = <P = any>(customUrl: string, payload: P, options: UseFetchOptions = {}) => {
    setUrl(customUrl);
    setMethod("PUT");
    setBody(payload);
    setCustomOptions(options);
    setShouldFetch(true);
  };
  const patch = <P = any>(customUrl: string, payload: P, options: UseFetchOptions = {}) => {
    setUrl(customUrl);
    setMethod("PATCH");
    setBody(payload);
    setCustomOptions(options);
    setShouldFetch(true);
  };
  const del = (customUrl: string, options: UseFetchOptions = {}) => {
    setUrl(customUrl);
    setMethod("DELETE");
    setBody(null);
    setCustomOptions(options);
    setShouldFetch(true);
  };

  return { data, error, loading, refetch, get, post, put, patch, del };
}
```

### useDebounce

---

```
// hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
```

### test cases

```
// __tests__/useFetch.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useFetch } from '../hooks/useFetch';

global.fetch = jest.fn();

describe('useFetch CRUD', () => {
  afterEach(() => jest.clearAllMocks());

  it('GET request works', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Rishabh' }),
      headers: { get: () => 'application/json' },
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useFetch('/api/users', {}, false)
    );

    act(() => result.current.get('/api/users'));

    await waitForNextUpdate();
    expect(result.current.data).toEqual({ id: 1, name: 'Rishabh' });
  });

  it('POST request works', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
      headers: { get: () => 'application/json' },
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useFetch('/api/users', {}, false)
    );

    act(() => result.current.post('/api/users', { name: 'Rishabh' }));
    await waitForNextUpdate();
    expect(result.current.data).toEqual({ success: true });
  });

  it('PUT request works', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ updated: true }),
      headers: { get: () => 'application/json' },
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useFetch('/api/users/1', {}, false)
    );

    act(() => result.current.put('/api/users/1', { name: 'Updated' }));
    await waitForNextUpdate();
    expect(result.current.data).toEqual({ updated: true });
  });

  it('PATCH request works', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ patched: true }),
      headers: { get: () => 'application/json' },
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useFetch('/api/users/1', {}, false)
    );

    act(() => result.current.patch('/api/users/1', { name: 'Patch' }));
    await waitForNextUpdate();
    expect(result.current.data).toEqual({ patched: true });
  });

  it('DELETE request works', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ deleted: true }),
      headers: { get: () => 'application/json' },
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useFetch('/api/users/1', {}, false)
    );

    act(() => result.current.del('/api/users/1'));
    await waitForNextUpdate();
    expect(result.current.data).toEqual({ deleted: true });
  });
});
```

### userform

```

// __tests__/UserForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserForm from '../components/UserForm';

jest.useFakeTimers();
global.fetch = jest.fn();

test('debounced POST works on input', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ name: 'Rishabh' }),
    headers: { get: () => 'application/json' },
  });

  render(<UserForm />);
  const input = screen.getByPlaceholderText(/enter name/i);
  fireEvent.change(input, { target: { value: 'Ris' } });

  jest.advanceTimersByTime(600); // trigger debounce
  await waitFor(() =>
    expect(fetch).toHaveBeenCalledWith('/api/users', expect.objectContaining({
      method: 'POST',
    }))
  );

  expect(await screen.findByText(/User created: Rishabh/)).toBeInTheDocument();
});

```

```

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CrudComponent } from "../components/CrudComponent";

jest.useFakeTimers();
global.fetch = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

describe("🧪 CrudComponent Test Suite", () => {
  test("GET (debounced search)", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: "Rishabh" }],
      headers: { get: () => "application/json" },
    });

    render(<CrudComponent />);
    const input = screen.getByPlaceholderText("Search");

    fireEvent.change(input, { target: { value: "ris" } });

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/users?query=ris",
        expect.objectContaining({ method: "GET" })
      );
      expect(screen.getByText(/Rishabh/)).toBeInTheDocument();
    });
  });

  test("POST (Create)", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 2, name: "New User" }),
      headers: { get: () => "application/json" },
    });

    render(<CrudComponent />);
    const createBtn = screen.getByText("Create");
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "New User" }),
        })
      );
    });
  });

  test("PUT (Update)", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: "Updated User" }),
      headers: { get: () => "application/json" },
    });

    render(<CrudComponent />);
    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/users/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ name: "Updated User" }),
        })
      );
    });
  });

  test("PATCH", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, active: true }),
      headers: { get: () => "application/json" },
    });

    render(<CrudComponent />);
    fireEvent.click(screen.getByText("Patch"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/users/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ active: true }),
        })
      );
    });
  });

  test("DELETE", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Deleted" }),
      headers: { get: () => "application/json" },
    });

    render(<CrudComponent />);
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/users/1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});


```
