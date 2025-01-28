"use client";

import { SchemaField } from "@/components/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { DatabaseSchemaGenerator } from "./database-schema-generator";
import { FieldBuilder } from "./field-builder";
import { JSONOutput } from "./json-output";
import { SchemaImporter } from "./schema-importer";
import { generateSchema } from "./utils";

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 p-4">
          <Tabs defaultValue="builder">
            <TabsList>
              <TabsTrigger value="builder">Schema Builder</TabsTrigger>
              <TabsTrigger value="importer">Import Schema</TabsTrigger>
              <TabsTrigger value="database">Database Schema</TabsTrigger>
            </TabsList>
            <TabsContent
              value="builder"
              className=" border border-gray-300 rounded-lg min-h-50"
            >
              <div className="space-y-2 p-3">
                {fields.map((field, index) => (
                  <FieldBuilder
                    key={index}
                    field={field}
                    onUpdate={(updatedField) =>
                      updateField(index, updatedField)
                    }
                    onRemove={() => removeField(index)}
                  />
                ))}
                <Button
                  onClick={() =>
                    addField({ name: "", type: "string", required: false })
                  }
                  className="px-4 text-xs"
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
        </div>
        <div className="col-span-1 my-7">
          <JSONOutput schema={schema} />
        </div>
      </div>
    </>
  );
}
