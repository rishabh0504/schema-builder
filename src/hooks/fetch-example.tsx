import React from "react";
import { useFetch } from "./useFetch";

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export default function App() {
  const { data, error, loading, get, post, put, patch, del, refetch } =
    useFetch<Post>("https://jsonplaceholder.typicode.com/posts/1");

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={() => get("https://jsonplaceholder.typicode.com/posts/1")}
        className="btn"
      >
        GET
      </button>
      <button
        onClick={() =>
          post("https://jsonplaceholder.typicode.com/posts", {
            title: "Hello",
            body: "World",
            userId: 1,
          })
        }
        className="btn"
      >
        POST
      </button>
      <button
        onClick={() =>
          put("https://jsonplaceholder.typicode.com/posts/1", {
            title: "Updated Title",
            body: "Updated Body",
            userId: 1,
          })
        }
        className="btn"
      >
        PUT
      </button>
      <button
        onClick={() =>
          patch("https://jsonplaceholder.typicode.com/posts/1", {
            title: "Patched Title",
          })
        }
        className="btn"
      >
        PATCH
      </button>
      <button
        onClick={() => del("https://jsonplaceholder.typicode.com/posts/1")}
        className="btn"
      >
        DELETE
      </button>
      <button onClick={refetch} className="btn">
        REFETCH
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {data && (
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
