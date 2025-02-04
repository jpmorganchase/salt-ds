import { z } from "zod";

// Define the schema for style properties for .saltButton
const SaltButtonColorProperties = z.object({
  "salt-actionable-bold-foreground": z.enum(["white", "black"]),
  "salt-actionable-bold-background": z.enum(["red", "green", "blue"]),
});
const SaltButtonSizeProperties = z.object({
  "saltButton-height": z.string().optional(),
});

const SaltButtonSpacingProperties = z.object({
  "saltButton-padding": z.string().optional(),
});

// Define the schema for style properties for .saltInput
const SaltInputStyleProperties = z.object({
  "salt-editable-secondary-background": z.string().optional(),
  "salt-editable-secondary-foreground": z.string().optional(),
});

// Define the schema for style properties for .saltCard
const SaltCardStyleProperties = z.object({
  "salt-card-background": z.string().optional(),
  "salt-card-border": z.string().optional(),
});

const createResponsivePropSchema = <T extends z.ZodTypeAny>(stylePropertiesSchema: T) =>
  z.union([
    z.object({
      xs: stylePropertiesSchema.optional(),
      sm: stylePropertiesSchema.optional(),
      md: stylePropertiesSchema.optional(),
      lg: stylePropertiesSchema.optional(),
    }),
    stylePropertiesSchema,
  ]);

const SaltButtonColorSchema = createResponsivePropSchema(SaltButtonColorProperties);
const SaltButtonSizeSchema = createResponsivePropSchema(SaltButtonSizeProperties);
const SaltButtonSpacingSchema = createResponsivePropSchema(SaltButtonSpacingProperties);
const SaltInputStyleSchema = createResponsivePropSchema(SaltInputStyleProperties);
const SaltCardStyleSchema = createResponsivePropSchema(SaltCardStyleProperties);

// Define the schema for specific component selectors
const ComponentSelectorSchema = z.object({
  ".saltButton": SaltButtonColorSchema.optional(),
  ".saltButton.salt-customizable-size-small": SaltButtonSizeSchema.optional(),
  ".saltButton.salt-customizable-size-medium": SaltButtonSizeSchema.optional(),
  ".saltButton.salt-customizable-size-large": SaltButtonSizeSchema.optional(),
  ".saltButton.salt-customizable-spacing-small": SaltButtonSpacingSchema.optional(),
  ".saltButton.salt-customizable-spacing-medium": SaltButtonSpacingSchema.optional(),
  ".saltButton.salt-customizable-spacing-large": SaltButtonSpacingSchema.optional(),
  ".saltInput": SaltInputStyleSchema.optional(),
  ".saltCard": SaltCardStyleSchema.optional(),
});

export const SampleSchema = ComponentSelectorSchema;
