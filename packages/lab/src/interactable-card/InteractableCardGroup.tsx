import React, { useState, useCallback } from "react";
import { InteractableCardGroupContext } from "./internal/InteractableCardGroupContext";
import { clsx } from "clsx";
import { FlexLayout } from "@salt-ds/core";

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
    <InteractableCardGroupContext.Provider value={{ select, isSelected }}>
      <FlexLayout className={clsx("interactableCardGroup", className)}>
        {children}
      </FlexLayout>
    </InteractableCardGroupContext.Provider>
  );
};
