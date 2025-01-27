import Image from "next/image";
import { SchemaBuilder } from "./schema-builder";

export default function Home() {
  return (
    <div>
      <main className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">
          AJV Schema Builder UI
        </h1>
        <SchemaBuilder />
      </main>
    </div>
  );
}
