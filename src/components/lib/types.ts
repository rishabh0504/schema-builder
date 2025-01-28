export type FieldType = "string" | "number" | "boolean" | "object" | "array";

export interface SchemaField {
  name: string;
  type: FieldType;
  required: boolean;
  children?: SchemaField[];
  // Validation properties
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
  // New properties
  description?: string;
  default?: any;
  format?: string;
  uniqueItems?: boolean;
}

export interface Schema {
  title?: string;
  type?: "object";
  properties?: Record<string, any>;
  required?: string[];
}
