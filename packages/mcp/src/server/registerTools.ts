import type {
  Implementation,
  McpServer,
  ServerContext,
} from "@modelcontextprotocol/server";
import {
  adaptSaltToolResult,
  createSaltToolWireContext,
  MAX_SEARCH_TOOL_RESULT_UTF8_BYTES,
  measureSaltToolBaseResultFrameUtf8Bytes,
  type SaltToolWireContext,
} from "./responseAdapters.js";
import {
  inspectSaltProjectOperation,
  reviewSaltCodeOperation,
  type SaltToolOperationContext,
  searchSaltOperation,
} from "./saltToolOperations.js";
import {
  INSPECT_TOOL_DEFINITION,
  REVIEW_TOOL_DEFINITION,
  type SaltToolName,
  SEARCH_TOOL_DEFINITION,
} from "./toolDefinitions.js";

export { MAX_SEARCH_TOOL_RESULT_UTF8_BYTES };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateAndAdapt(
  name: SaltToolName,
  outputValidationSchema: {
    safeParse(
      value: unknown,
    ): { success: true; data: unknown } | { success: false };
  },
  payload: unknown,
  wireContext: SaltToolWireContext,
) {
  const validated = outputValidationSchema.safeParse(payload);
  if (!validated.success || !isRecord(validated.data)) {
    throw new Error(
      `${name} returned a result that failed its strict internal output contract.`,
    );
  }
  return adaptSaltToolResult(name, validated.data, wireContext);
}

type SaltToolRegistrationContext = Omit<
  SaltToolOperationContext,
  "measureFinalResultUtf8Bytes"
>;

function requestOperationContext(
  context: SaltToolRegistrationContext,
  name: SaltToolName,
  serverContext: ServerContext,
  serverInfo: Implementation,
): { operationContext: SaltToolOperationContext; wireContext: SaltToolWireContext } {
  const wireContext = createSaltToolWireContext(serverContext, serverInfo);
  return {
    wireContext,
    operationContext: {
      ...context,
      measureFinalResultUtf8Bytes(payload) {
        if (!isRecord(payload)) {
          throw new Error(`${name} produced a non-object public payload.`);
        }
        return measureSaltToolBaseResultFrameUtf8Bytes(
          name,
          payload,
          wireContext,
        );
      },
    },
  };
}

export function registerSaltTools(
  server: McpServer,
  context: SaltToolRegistrationContext,
  serverInfo: Implementation,
): void {
  server.registerTool(
    SEARCH_TOOL_DEFINITION.name,
    {
      description: SEARCH_TOOL_DEFINITION.description,
      inputSchema: SEARCH_TOOL_DEFINITION.inputSchema,
      outputSchema: SEARCH_TOOL_DEFINITION.outputSchema,
      annotations: SEARCH_TOOL_DEFINITION.annotations,
    },
    async (input, serverContext) => {
      const { operationContext, wireContext } = requestOperationContext(
        context,
        SEARCH_TOOL_DEFINITION.name,
        serverContext,
        serverInfo,
      );
      return validateAndAdapt(
        SEARCH_TOOL_DEFINITION.name,
        SEARCH_TOOL_DEFINITION.outputValidationSchema,
        await searchSaltOperation(operationContext, input),
        wireContext,
      );
    },
  );
  server.registerTool(
    INSPECT_TOOL_DEFINITION.name,
    {
      description: INSPECT_TOOL_DEFINITION.description,
      inputSchema: INSPECT_TOOL_DEFINITION.inputSchema,
      outputSchema: INSPECT_TOOL_DEFINITION.outputSchema,
      annotations: INSPECT_TOOL_DEFINITION.annotations,
    },
    async (input, serverContext) => {
      const { operationContext, wireContext } = requestOperationContext(
        context,
        INSPECT_TOOL_DEFINITION.name,
        serverContext,
        serverInfo,
      );
      return validateAndAdapt(
        INSPECT_TOOL_DEFINITION.name,
        INSPECT_TOOL_DEFINITION.outputValidationSchema,
        await inspectSaltProjectOperation(operationContext, input),
        wireContext,
      );
    },
  );
  server.registerTool(
    REVIEW_TOOL_DEFINITION.name,
    {
      description: REVIEW_TOOL_DEFINITION.description,
      inputSchema: REVIEW_TOOL_DEFINITION.inputSchema,
      outputSchema: REVIEW_TOOL_DEFINITION.outputSchema,
      annotations: REVIEW_TOOL_DEFINITION.annotations,
    },
    async (input, serverContext) => {
      const { operationContext, wireContext } = requestOperationContext(
        context,
        REVIEW_TOOL_DEFINITION.name,
        serverContext,
        serverInfo,
      );
      return validateAndAdapt(
        REVIEW_TOOL_DEFINITION.name,
        REVIEW_TOOL_DEFINITION.outputValidationSchema,
        await reviewSaltCodeOperation(operationContext, input),
        wireContext,
      );
    },
  );
}
