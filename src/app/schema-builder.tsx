"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldBuilder } from "./field-builder";
import { JSONOutput } from "./json-output";
import { SchemaImporter } from "./schema-importer";
import { DatabaseSchemaGenerator } from "./database-schema-generator";
import type { SchemaField } from "./types";
import { generateSchema } from "./utils";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SchemaBuilder() {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const { toast } = useToast();

  const addField = (field: SchemaField) => {
    setFields([...fields, field]);
    toast({
      title: "Field Added",
      description: `New field "${field.name}" of type ${field.type} has been added.`,
    });
  };

  const updateField = (index: number, updatedField: SchemaField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    const fieldName = fields[index].name;
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    toast({
      title: "Field Removed",
      description: `Field "${fieldName}" has been removed.`,
      variant: "destructive",
    });
  };

  const handleImport = (importedFields: SchemaField[]) => {
    setFields(importedFields);
    toast({
      title: "Schema Imported",
      description: "The schema has been successfully imported and loaded.",
    });
  };

  const schema = generateSchema(fields);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>AJV Schema Builder v4</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="builder">
          <TabsList>
            <TabsTrigger value="builder">Schema Builder</TabsTrigger>
            <TabsTrigger value="importer">Import Schema</TabsTrigger>
            <TabsTrigger value="database">Database Schema</TabsTrigger>
          </TabsList>
          <TabsContent value="builder">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <FieldBuilder
                  key={index}
                  field={field}
                  onUpdate={(updatedField) => updateField(index, updatedField)}
                  onRemove={() => removeField(index)}
                />
              ))}
              <Button
                onClick={() =>
                  addField({ name: "", type: "string", required: false })
                }
              >
                Add Field
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="importer">
            <SchemaImporter onImport={handleImport} />
          </TabsContent>
          <TabsContent value="database">
            <DatabaseSchemaGenerator jsonSchema={schema} />
          </TabsContent>
        </Tabs>
        <JSONOutput schema={schema} />
      </CardContent>
      <Toaster />
    </Card>
  );
}
