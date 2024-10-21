import React from "react";
import { Button } from "../src/button/Button";
import figma from "@figma/code-connect";

// Neutral - 5594:10494
figma.connect(
  Button,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=5594%3A10494",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label"),
      labelTextValue: figma.string("Label text value"),
      rightIcon: figma.boolean("Right icon"),
      rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon"),
      leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        disabled={props.disabled}
        sentiment="neutral"
        appearance={props.appearance}
      >
        {props.leftIcon && props.leftIconType}
        {props.label && props.labelTextValue}
        {props.rightIcon && props.rightIconType}
      </Button>
    ),
  },
);
// Accented - 5594:10364
figma.connect(
  Button,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=5594%3A10364",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label"),
      labelTextValue: figma.string("Label text value"),
      rightIcon: figma.boolean("Right icon"),
      rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon"),
      leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        disabled={props.disabled}
        sentiment="accented"
        appearance={props.appearance}
      >
        {props.leftIcon && props.leftIconType}
        {props.label && props.labelTextValue}
        {props.rightIcon && props.rightIconType}
      </Button>
    ),
  },
);

// Caution - 32192:104949
figma.connect(
  Button,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=32192%3A104949",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label"),
      labelTextValue: figma.string("Label text value"),
      rightIcon: figma.boolean("Right icon"),
      rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon"),
      leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        disabled={props.disabled}
        sentiment="caution"
        appearance={props.appearance}
      >
        {props.leftIcon && props.leftIconType}
        {props.label && props.labelTextValue}
        {props.rightIcon && props.rightIconType}
      </Button>
    ),
  },
);
// Positive - 32189:104771
figma.connect(
  Button,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=32189%3A104771",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label"),
      labelTextValue: figma.string("Label text value"),
      rightIcon: figma.boolean("Right icon"),
      rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon"),
      leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        disabled={props.disabled}
        sentiment="positive"
        appearance={props.appearance}
      >
        {props.leftIcon && props.leftIconType}
        {props.label && props.labelTextValue}
        {props.rightIcon && props.rightIconType}
      </Button>
    ),
  },
);
// Negative - 32148:16178
figma.connect(
  Button,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=32148%3A16178",
  {
    props: {
      // These props were automatically mapped based on your linked code:
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      appearance: figma.enum("Appearance", {
        Solid: "solid",
        Bordered: "bordered",
        Transparent: "transparent",
      }),
      label: figma.boolean("Label"),
      labelTextValue: figma.string("Label text value"),
      rightIcon: figma.boolean("Right icon"),
      rightIconType: figma.instance("Right icon type"),
      leftIcon: figma.boolean("Left icon"),
      leftIconType: figma.instance("Left icon type"),
      // No matching props could be found for these Figma properties:
    },
    example: (props) => (
      <Button
        disabled={props.disabled}
        sentiment="negative"
        appearance={props.appearance}
      >
        {props.leftIcon && props.leftIconType}
        {props.label && props.labelTextValue}
        {props.rightIcon && props.rightIconType}
      </Button>
    ),
  },
);
