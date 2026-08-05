import type { StandardSchemaWithJSON } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

type JsonSchema = Record<string, unknown>;

function schemaChildren(schema: JsonSchema): JsonSchema[] {
  const children: JsonSchema[] = [];
  const properties = schema.properties;
  if (
    properties &&
    typeof properties === "object" &&
    !Array.isArray(properties)
  ) {
    for (const value of Object.values(properties)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        children.push(value as JsonSchema);
      }
    }
  }
  const items = schema.items;
  if (items && typeof items === "object" && !Array.isArray(items)) {
    children.push(items as JsonSchema);
  }
  for (const keyword of ["anyOf", "oneOf", "allOf"] as const) {
    const values = schema[keyword];
    if (!Array.isArray(values)) continue;
    for (const value of values) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        children.push(value as JsonSchema);
      }
    }
  }
  return children;
}

function replaceSchemaChildren(
  schema: JsonSchema,
  replace: (child: JsonSchema) => JsonSchema,
): JsonSchema {
  const output = { ...schema };
  if (
    output.properties &&
    typeof output.properties === "object" &&
    !Array.isArray(output.properties)
  ) {
    output.properties = Object.fromEntries(
      Object.entries(output.properties).map(([key, value]) => [
        key,
        value && typeof value === "object" && !Array.isArray(value)
          ? replace(value as JsonSchema)
          : value,
      ]),
    );
  }
  if (
    output.items &&
    typeof output.items === "object" &&
    !Array.isArray(output.items)
  ) {
    output.items = replace(output.items as JsonSchema);
  }
  for (const keyword of ["anyOf", "oneOf", "allOf"] as const) {
    const values = output[keyword];
    if (!Array.isArray(values)) continue;
    output[keyword] = values.map((value) =>
      value && typeof value === "object" && !Array.isArray(value)
        ? replace(value as JsonSchema)
        : value,
    );
  }
  return output;
}

function omitRuntimeOnlyBounds(schema: JsonSchema): JsonSchema {
  const output = { ...schema };
  if (Array.isArray(output.enum) || Object.hasOwn(output, "const")) {
    delete output.type;
  }
  for (const keyword of [
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "minLength",
    "maxLength",
    "minItems",
    "maxItems",
  ]) {
    delete output[keyword];
  }
  const properties = output.properties;
  const required = output.required;
  if (
    output.additionalProperties === false &&
    properties &&
    typeof properties === "object" &&
    !Array.isArray(properties) &&
    Array.isArray(required) &&
    !Object.hasOwn(output, "patternProperties") &&
    !Object.hasOwn(output, "allOf") &&
    !Object.hasOwn(output, "anyOf") &&
    !Object.hasOwn(output, "oneOf")
  ) {
    const propertyNames = Object.keys(properties);
    const requiredNames = required.filter(
      (name): name is string => typeof name === "string",
    );
    if (
      new Set(requiredNames).size === propertyNames.length &&
      propertyNames.every((name) => requiredNames.includes(name))
    ) {
      const requiredEncoding = JSON.stringify({ required });
      const countEncoding = JSON.stringify({
        minProperties: propertyNames.length,
      });
      if (countEncoding.length < requiredEncoding.length) {
        output.minProperties = propertyNames.length;
        delete output.required;
      }
    }
  }
  return output;
}

function compactNullableUnions(schema: JsonSchema): JsonSchema {
  const output = replaceSchemaChildren(schema, compactNullableUnions);
  const branches = output.anyOf;
  if (!Array.isArray(branches) || branches.length !== 2) return output;

  const nullIndex = branches.findIndex(
    (branch) =>
      branch &&
      typeof branch === "object" &&
      !Array.isArray(branch) &&
      Object.keys(branch).length === 1 &&
      branch.type === "null",
  );
  if (nullIndex < 0) return output;

  const valueBranch = branches[nullIndex === 0 ? 1 : 0];
  if (
    !valueBranch ||
    typeof valueBranch !== "object" ||
    Array.isArray(valueBranch) ||
    typeof valueBranch.type !== "string" ||
    valueBranch.type === "null"
  ) {
    return output;
  }

  const compacted = {
    ...output,
    ...valueBranch,
    type: [valueBranch.type, "null"],
  };
  delete compacted.anyOf;
  if (Array.isArray(valueBranch.enum)) {
    compacted.enum = [...valueBranch.enum, null];
  } else if (Object.hasOwn(valueBranch, "const")) {
    compacted.enum = [valueBranch.const, null];
    delete compacted.const;
  }
  return compacted;
}

function compactJsonSchema(root: JsonSchema): JsonSchema {
  const normalizedRoot = compactNullableUnions(root);
  const counts = new Map<string, { count: number; schema: JsonSchema }>();
  const visit = (schema: JsonSchema, isRoot = false) => {
    if (!isRoot) {
      const signature = JSON.stringify(schema);
      const current = counts.get(signature);
      counts.set(signature, {
        count: (current?.count ?? 0) + 1,
        schema,
      });
    }
    for (const child of schemaChildren(schema)) visit(child);
  };
  visit(normalizedRoot, true);

  const selected = [...counts.entries()]
    .filter(
      ([signature, entry]) =>
        entry.count > 1 &&
        signature.length >= 24 &&
        (signature.length - 24) * (entry.count - 1) > 0,
    )
    .sort(([left], [right]) => left.localeCompare(right));
  const names = new Map(
    selected.map(([signature], index) => [signature, `s${index}`]),
  );
  const transform = (schema: JsonSchema, ownSignature?: string): JsonSchema =>
    omitRuntimeOnlyBounds(
      replaceSchemaChildren(schema, (child) => {
        const signature = JSON.stringify(child);
        const name =
          signature === ownSignature ? undefined : names.get(signature);
        return name ? { $ref: `#/$defs/${name}` } : transform(child, signature);
      }),
    );
  if (selected.length === 0) return omitRuntimeOnlyBounds(normalizedRoot);
  return {
    ...transform(normalizedRoot),
    $defs: Object.fromEntries(
      selected.map(([signature, entry]) => [
        names.get(signature)!,
        transform(entry.schema, signature),
      ]),
    ),
  };
}

export function compactStandardOutputSchema(
  schema: z.ZodType,
): StandardSchemaWithJSON {
  const standard = schema["~standard"];
  return {
    "~standard": {
      ...standard,
      jsonSchema: {
        input: (options) =>
          compactJsonSchema(
            z.toJSONSchema(schema, {
              target: options.target,
              io: "input",
            }) as JsonSchema,
          ),
        output: (options) =>
          compactJsonSchema(
            z.toJSONSchema(schema, {
              target: options.target,
              io: "output",
            }) as JsonSchema,
          ),
      },
    },
  };
}
