import { z } from "zod";

// Define the schema for style properties for .saltButton
const SaltButtonColorProperties = z.object({
  "button-color-default": z.enum(["white", "grey", "black"]).optional(),
  "button-color-hover": z.enum(["white", "grey", "black"]).optional(),
  "button-color-active": z.enum(["white", "grey", "black"]).optional(),
  "button-color-disabled": z.enum(["white", "grey", "black"]).optional(),
  "button-background-default": z.enum(["red", "green", "blue"]).optional(),
  "button-background-hover": z.enum(["red", "green", "blue"]).optional(),
  "button-background-active": z.enum(["red", "green", "blue"]).optional(),
  "button-background-disabled": z.enum(["red", "green", "blue"]).optional(),
});
const SaltButtonSizeProperties = z.object({
  "button-height": z.string().optional(),
});

const SaltButtonSpacingProperties = z.object({
  "button-padding": z.string().optional(),
});

// Define the schema for style properties for .saltInput
const SaltInputStyleProperties = z.object({
  "saltInput-contract-height": z.string().optional(),
  "saltInput-contract-fontSize": z.string().optional(),
  "salt-editable-primary-background": z
    .enum(["red", "green", "blue"])
    .optional(),
  "salt-editable-primary-foreground": z.enum(["white", "black"]).optional(),
});

// Define the schema for style properties for .saltCard
const SaltCardStyleProperties = z.object({
  "salt-card-background": z.string().optional(),
  "salt-card-border": z.string().optional(),
});

const createResponsivePropSchema = <T extends z.ZodTypeAny>(
  stylePropertiesSchema: T,
) =>
  z.union([
    z.object({
      xs: stylePropertiesSchema.optional(),
      sm: stylePropertiesSchema.optional(),
      md: stylePropertiesSchema.optional(),
      lg: stylePropertiesSchema.optional(),
    }),
    stylePropertiesSchema,
  ]);

const SaltButtonColorSchema = createResponsivePropSchema(
  SaltButtonColorProperties,
);
const SaltButtonSizeSchema = createResponsivePropSchema(
  SaltButtonSizeProperties,
);
const SaltButtonSpacingSchema = createResponsivePropSchema(
  SaltButtonSpacingProperties,
);
const SaltInputStyleSchema = createResponsivePropSchema(
  SaltInputStyleProperties,
);
const SaltCardStyleSchema = createResponsivePropSchema(SaltCardStyleProperties);

// Define the schema for specific component selectors
const ComponentSelectorSchema = z.object({
  ".saltButton": SaltButtonColorSchema.optional(),
  ".saltButton-neutral.saltButton-solid": SaltButtonColorSchema.optional(),
  ".saltButton.salt-customizable-size-small": SaltButtonSizeSchema.optional(),
  ".saltButton.salt-customizable-size-medium": SaltButtonSizeSchema.optional(),
  ".saltButton.salt-customizable-size-large": SaltButtonSizeSchema.optional(),
  ".saltButton.salt-customizable-spacing-small":
    SaltButtonSpacingSchema.optional(),
  ".saltButton.salt-customizable-spacing-medium":
    SaltButtonSpacingSchema.optional(),
  ".saltButton.salt-customizable-spacing-large":
    SaltButtonSpacingSchema.optional(),
  ".saltInput": SaltInputStyleSchema.optional(),
  ".saltCard": SaltCardStyleSchema.optional(),
});

export const SampleSchema = ComponentSelectorSchema;
