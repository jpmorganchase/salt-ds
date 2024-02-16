import React, { useState, useCallback } from "react";
import { InteractableCardGroupContext } from "./internal/InteractableCardGroupContext";
import { clsx } from "clsx";
import { FlowLayout } from "@salt-ds/core";

interface InteractableCardGroupProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const InteractableCardGroup: React.FC<InteractableCardGroupProps> = ({
  defaultValue,
  onChange,
  children,
  className,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    defaultValue
  );

  const select = useCallback(
    (value: string | number) => {
      if (value !== selectedValue) {
        setSelectedValue(value.toString());
        onChange && onChange(value.toString());
      }
    },
    [selectedValue, onChange]
  );

  const isSelected = useCallback(
    (id: string | undefined) => {
      return selectedValue === id;
    },
    [selectedValue]
  );

  return (
    // TODO: fix type error
    <InteractableCardGroupContext.Provider value={{ select, isSelected }}>
      {/* TODO: update layout options */}
      <FlowLayout gap={1} className={clsx("interactableCardGroup", className)}>
        {children}
      </FlowLayout>
    </InteractableCardGroupContext.Provider>
  );
};
