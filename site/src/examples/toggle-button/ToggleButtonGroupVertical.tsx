import { FlowLayout, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import {
  SemanticDissatisfiedIcon,
  SemanticNeutralIcon,
  SemanticSatisfiedIcon,
  SemanticVeryDissatisfiedIcon,
  SemanticVerySatisfiedIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ToggleButtonGroupVertical = (): ReactElement => (
  <FlowLayout>
    <ToggleButtonGroup defaultValue="4" orientation="vertical">
      <ToggleButton value="5">
        <SemanticVerySatisfiedIcon aria-hidden />
        Very satisfied
      </ToggleButton>
      <ToggleButton value="4">
        <SemanticSatisfiedIcon aria-hidden />
        Satisfied
      </ToggleButton>
      <ToggleButton value="3">
        <SemanticNeutralIcon aria-hidden />
        Neutral
      </ToggleButton>
      <ToggleButton value="2">
        <SemanticDissatisfiedIcon aria-hidden />
        Dissatisfied
      </ToggleButton>
      <ToggleButton value="1">
        <SemanticVeryDissatisfiedIcon aria-hidden />
        Very dissatisfied
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup defaultValue="4" orientation="vertical">
      <ToggleButton value="5">
        <SemanticVerySatisfiedIcon aria-hidden />
      </ToggleButton>
      <ToggleButton value="4">
        <SemanticSatisfiedIcon aria-hidden />
      </ToggleButton>
      <ToggleButton value="3">
        <SemanticNeutralIcon aria-hidden />
      </ToggleButton>
      <ToggleButton value="2">
        <SemanticDissatisfiedIcon aria-hidden />
      </ToggleButton>
      <ToggleButton value="1">
        <SemanticVeryDissatisfiedIcon aria-hidden />
      </ToggleButton>
    </ToggleButtonGroup>
  </FlowLayout>
);
