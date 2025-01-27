import type { FieldType, Schema, SchemaField } from "./types";

export function generateSchema(fields: SchemaField[]): Schema {
  const schema: Schema = {
    type: "object",
    properties: {},
    required: [],
  };

  fields.forEach((field) => {
    schema.properties[field.name] = generateFieldSchema(field);
    if (field.required) {
      schema.required.push(field.name);
    }
  });

  return schema;
}

function generateFieldSchema(field: SchemaField): any {
  const fieldSchema: any = { type: field.type };

  if (field.type === "object" && field.children) {
    fieldSchema.properties = {};
    fieldSchema.required = [];
    field.children.forEach((child) => {
      fieldSchema.properties[child.name] = generateFieldSchema(child);
      if (child.required) {
        fieldSchema.required.push(child.name);
      }
    });
  } else if (field.type === "array" && field.children) {
    fieldSchema.items = generateFieldSchema(field.children[0]);
  }

  // Add validation properties
  if (field.minimum !== undefined) fieldSchema.minimum = field.minimum;
  if (field.maximum !== undefined) fieldSchema.maximum = field.maximum;
  if (field.minLength !== undefined) fieldSchema.minLength = field.minLength;
  if (field.maxLength !== undefined) fieldSchema.maxLength = field.maxLength;
  if (field.pattern !== undefined) fieldSchema.pattern = field.pattern;
  if (field.enum !== undefined) fieldSchema.enum = field.enum;

  // Add new properties
  if (field.description) fieldSchema.description = field.description;
  if (field.default !== undefined) fieldSchema.default = field.default;
  if (field.format) fieldSchema.format = field.format;
  if (field.uniqueItems !== undefined)
    fieldSchema.uniqueItems = field.uniqueItems;

  return fieldSchema;
}

export function parseSchema(schema: any): SchemaField[] {
  if (schema.type !== "object") {
    throw new Error("Root schema must be an object");
  }

  return Object.entries(schema.properties).map(
    ([name, prop]: [string, any]) => {
      return parseSchemaField(
        name,
        prop,
        schema.required?.includes(name) || false
      );
    }
  );
}

function parseSchemaField(
  name: string,
  schema: any,
  required: boolean
): SchemaField {
  const field: SchemaField = {
    name,
    type: schema.type as FieldType,
    required,
  };

  if (schema.description) field.description = schema.description;
  if (schema.default !== undefined) field.default = schema.default;
  if (schema.format) field.format = schema.format;
  if (schema.uniqueItems !== undefined) field.uniqueItems = schema.uniqueItems;

  if (schema.minimum !== undefined) field.minimum = schema.minimum;
  if (schema.maximum !== undefined) field.maximum = schema.maximum;
  if (schema.minLength !== undefined) field.minLength = schema.minLength;
  if (schema.maxLength !== undefined) field.maxLength = schema.maxLength;
  if (schema.pattern !== undefined) field.pattern = schema.pattern;
  if (schema.enum !== undefined) field.enum = schema.enum;

  if (schema.type === "object" && schema.properties) {
    field.children = Object.entries(schema.properties).map(
      ([childName, childProp]: [string, any]) => {
        return parseSchemaField(
          childName,
          childProp,
          schema.required?.includes(childName) || false
        );
      }
    );
  } else if (schema.type === "array" && schema.items) {
    field.children = [parseSchemaField("items", schema.items, false)];
  }

  return field;
}
