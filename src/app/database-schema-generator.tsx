"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Schema, SchemaField } from "@/lib/types";

interface DatabaseSchemaGeneratorProps {
  jsonSchema: Schema;
}

type DatabaseType = "postgresql" | "mysql" | "sqlite";

export function DatabaseSchemaGenerator({
  jsonSchema,
}: DatabaseSchemaGeneratorProps) {
  const [databaseType, setDatabaseType] = useState<DatabaseType>("postgresql");
  const [generatedSchema, setGeneratedSchema] = useState("");

  const generateDatabaseSchema = () => {
    let schema = "";

    switch (databaseType) {
      case "postgresql":
        schema = generatePostgresSchema(jsonSchema);
        break;
      case "mysql":
        schema = generateMySQLSchema(jsonSchema);
        break;
      case "sqlite":
        schema = generateSQLiteSchema(jsonSchema);
        break;
    }

    setGeneratedSchema(schema);
  };

  const generatePostgresSchema = (schema: Schema): string => {
    let result = "";
    let foreignKeys: string[] = [];
    Object.entries(schema.properties).forEach(([name, prop]: [string, any]) => {
      const { columnDef, relationshipDefs } = getPostgresColumnAndRelationship(
        name,
        prop
      );
      result += columnDef;
      foreignKeys = [...foreignKeys, ...relationshipDefs];
    });
    return `CREATE TABLE ${
      schema.title || "table_name"
    } (\n${result}${foreignKeys.join(",\n")}\n);`;
  };

  const generateMySQLSchema = (schema: Schema): string => {
    let result = "";
    let foreignKeys: string[] = [];
    Object.entries(schema.properties).forEach(([name, prop]: [string, any]) => {
      const { columnDef, relationshipDefs } = getMySQLColumnAndRelationship(
        name,
        prop
      );
      result += columnDef;
      foreignKeys = [...foreignKeys, ...relationshipDefs];
    });
    return `CREATE TABLE ${
      schema.title || "table_name"
    } (\n${result}${foreignKeys.join(",\n")}\n);`;
  };

  const generateSQLiteSchema = (schema: Schema): string => {
    let result = "";
    let foreignKeys: string[] = [];
    Object.entries(schema.properties).forEach(([name, prop]: [string, any]) => {
      const { columnDef, relationshipDefs } = getSQLiteColumnAndRelationship(
        name,
        prop
      );
      result += columnDef;
      foreignKeys = [...foreignKeys, ...relationshipDefs];
    });
    return `CREATE TABLE ${
      schema.title || "table_name"
    } (\n${result}${foreignKeys.join(",\n")}\n);`;
  };

  const getPostgresColumnAndRelationship = (
    name: string,
    prop: any
  ): { columnDef: string; relationshipDefs: string[] } => {
    let columnDef = "";
    const relationshipDefs: string[] = [];

    if (prop.type === "object" && prop.properties) {
      // Handle nested object (One-to-One relationship)
      columnDef += `${name}_id INTEGER,\n`;
      relationshipDefs.push(`FOREIGN KEY (${name}_id) REFERENCES ${name}(id)`);

      // Create a new table for the nested object
      const nestedTableSchema = generatePostgresSchema({
        type: "object",
        properties: prop.properties,
        title: name,
      });
      columnDef += `\n-- Nested table for ${name}\n${nestedTableSchema}\n`;
    } else if (
      prop.type === "array" &&
      prop.items &&
      prop.items.type === "object"
    ) {
      // Handle array of objects (One-to-Many relationship)
      relationshipDefs.push(
        `-- One-to-Many relationship: Create a separate table for ${name} with a foreign key to this table`
      );

      // Create a new table for the array items
      const itemsTableSchema = generatePostgresSchema({
        type: "object",
        properties: {
          ...prop.items.properties,
          parent_id: { type: "integer" },
        },
        title: `${name}_items`,
      });
      columnDef += `\n-- Items table for ${name}\n${itemsTableSchema}\n`;
    } else {
      columnDef += `${name} ${getPostgresType(prop)},\n`;
    }

    return { columnDef, relationshipDefs };
  };

  const getMySQLColumnAndRelationship = (
    name: string,
    prop: any
  ): { columnDef: string; relationshipDefs: string[] } => {
    let columnDef = "";
    const relationshipDefs: string[] = [];

    if (prop.type === "object" && prop.properties) {
      // Handle nested object (One-to-One relationship)
      columnDef += `${name}_id INT,\n`;
      relationshipDefs.push(`FOREIGN KEY (${name}_id) REFERENCES ${name}(id)`);

      // Create a new table for the nested object
      const nestedTableSchema = generateMySQLSchema({
        type: "object",
        properties: prop.properties,
        title: name,
      });
      columnDef += `\n-- Nested table for ${name}\n${nestedTableSchema}\n`;
    } else if (
      prop.type === "array" &&
      prop.items &&
      prop.items.type === "object"
    ) {
      // Handle array of objects (One-to-Many relationship)
      relationshipDefs.push(
        `-- One-to-Many relationship: Create a separate table for ${name} with a foreign key to this table`
      );

      // Create a new table for the array items
      const itemsTableSchema = generateMySQLSchema({
        type: "object",
        properties: {
          ...prop.items.properties,
          parent_id: { type: "integer" },
        },
        title: `${name}_items`,
      });
      columnDef += `\n-- Items table for ${name}\n${itemsTableSchema}\n`;
    } else {
      columnDef += `${name} ${getMySQLType(prop)},\n`;
    }

    return { columnDef, relationshipDefs };
  };

  const getSQLiteColumnAndRelationship = (
    name: string,
    prop: any
  ): { columnDef: string; relationshipDefs: string[] } => {
    let columnDef = "";
    const relationshipDefs: string[] = [];

    if (prop.type === "object" && prop.properties) {
      // Handle nested object (One-to-One relationship)
      columnDef += `${name}_id INTEGER,\n`;
      relationshipDefs.push(`FOREIGN KEY (${name}_id) REFERENCES ${name}(id)`);

      // Create a new table for the nested object
      const nestedTableSchema = generateSQLiteSchema({
        type: "object",
        properties: prop.properties,
        title: name,
      });
      columnDef += `\n-- Nested table for ${name}\n${nestedTableSchema}\n`;
    } else if (
      prop.type === "array" &&
      prop.items &&
      prop.items.type === "object"
    ) {
      // Handle array of objects (One-to-Many relationship)
      relationshipDefs.push(
        `-- One-to-Many relationship: Create a separate table for ${name} with a foreign key to this table`
      );

      // Create a new table for the array items
      const itemsTableSchema = generateSQLiteSchema({
        type: "object",
        properties: {
          ...prop.items.properties,
          parent_id: { type: "integer" },
        },
        title: `${name}_items`,
      });
      columnDef += `\n-- Items table for ${name}\n${itemsTableSchema}\n`;
    } else {
      columnDef += `${name} ${getSQLiteType(prop)},\n`;
    }

    return { columnDef, relationshipDefs };
  };

  const getPostgresType = (prop: any): string => {
    switch (prop.type) {
      case "string":
        return prop.format === "date-time" ? "TIMESTAMP" : "TEXT";
      case "number":
        return "NUMERIC";
      case "integer":
        return "INTEGER";
      case "boolean":
        return "BOOLEAN";
      default:
        return "TEXT";
    }
  };

  const getMySQLType = (prop: any): string => {
    switch (prop.type) {
      case "string":
        return prop.format === "date-time" ? "DATETIME" : "VARCHAR(255)";
      case "number":
        return "DECIMAL";
      case "integer":
        return "INT";
      case "boolean":
        return "BOOLEAN";
      default:
        return "TEXT";
    }
  };

  const getSQLiteType = (prop: any): string => {
    switch (prop.type) {
      case "string":
        return "TEXT";
      case "number":
      case "integer":
        return "NUMERIC";
      case "boolean":
        return "INTEGER";
      default:
        return "TEXT";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="database-type">Select Database Type</Label>
        <Select onValueChange={(value: DatabaseType) => setDatabaseType(value)}>
          <SelectTrigger id="database-type">
            <SelectValue placeholder="Select database type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="postgresql">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
            <SelectItem value="sqlite">SQLite</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={generateDatabaseSchema}>Generate Database Schema</Button>
      <div>
        <Label htmlFor="generated-schema">Generated Database Schema</Label>
        <Textarea
          id="generated-schema"
          value={generatedSchema}
          readOnly
          rows={10}
        />
      </div>
    </div>
  );
}
