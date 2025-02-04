import { z, ZodSchema } from "zod";

function createErrorMessage(validationResult: z.SafeParseError<any>) {
  const message = [];
  message.push("Style contract validation failed:");
  validationResult.error.errors.forEach((error) => {
    message.push(`Path: ${error.path.join(" -> ")}`);
    message.push(`Message: ${error.message}`);

    // Check for union errors
    const unionErrors = (error as any).unionErrors;
    if (unionErrors) {
      message.push(
        "Error in union, expected one of the following paths to have a valid/supported value:",
      );
      unionErrors.forEach((unionError: { issues: z.ZodIssue[] }) => {
        unionError.issues.forEach((issue) => {
          message.push(`  Path: ${issue.path.join(" -> ")}`);
          message.push(`  Message: ${issue.message}`);
          if (issue.code === "invalid_enum_value") {
            message.push(`  Received: ${issue.received}`);
            message.push(`  Expected one of: ${issue.options.join(", ")}`);
          } else if (issue.code === "invalid_type") {
            message.push(`  Expected: ${issue.expected}`);
            message.push(`  Received: ${issue.received}`);
          }
        });
      });
    }
  });
  return message.join("\n");
}

export interface StyleContractProps<T extends ZodSchema<any>> {
  name: string;
  contract: z.infer<T>;
  schema: T;
}

export class StyleContract<T extends ZodSchema<any>> {
  name: string;
  contract: z.infer<T>;
  schema: T;

  constructor(props: StyleContractProps<T>) {
    this.name = props.name;
    this.contract = props.contract;
    this.schema = props.schema;
  }

  validate() {
    const validationResult = this.schema.safeParse(this.contract);
    if (!validationResult.success) {
      const message = createErrorMessage(validationResult);
      throw new Error(message);
    }
  }
}
