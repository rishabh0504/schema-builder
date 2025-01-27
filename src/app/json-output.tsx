"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactJson from "react-json-view";
import type { Schema } from "./types";

interface JSONOutputProps {
  schema: Schema;
}

export function JSONOutput({ schema }: JSONOutputProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          JSON Schema
          <div>
            <Button onClick={copyToClipboard} className="mr-2">
              Copy
            </Button>
            <Button onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? "Expand" : "Collapse"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tree">
          <TabsList>
            <TabsTrigger value="tree">Tree View</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="tree">
            <ReactJson
              src={schema}
              theme="monokai"
              collapsed={isCollapsed ? 1 : false}
              enableClipboard={false}
              displayDataTypes={false}
            />
          </TabsContent>
          <TabsContent value="raw">
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
