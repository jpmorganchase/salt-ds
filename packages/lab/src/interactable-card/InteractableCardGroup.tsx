import React, { useState, useCallback } from "react";
import { InteractableCardGroupContext } from "./internal/InteractableCardGroupContext";
import { clsx } from "clsx";
import { FlexLayout } from "@salt-ds/core";

// Define the props for InteractableCardGroup
interface InteractableCardGroupProps {
  defaultValue?: string; // Default selected value
  onChange?: (value: string) => void; // Callback for when selection changes
  children: React.ReactNode;
  className?: string;
}

export const InteractableCardGroup: React.FC<InteractableCardGroupProps> = ({
  defaultValue,
  onChange,
  children,
  className,
}) => {
  // State to track selected value
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    defaultValue
  );

  // Function to handle selection
  const select = useCallback(
    (value: string | number) => {
      if (value !== selectedValue) {
        setSelectedValue(value.toString());
        onChange && onChange(value.toString());
      }
    },
    [selectedValue, onChange]
  );

  // Function to check if a card is selected
  const isSelected = useCallback(
    (id: string | undefined) => {
      return selectedValue === id;
    },
    [selectedValue]
  );

  // Provide context and render children
  return (
    <InteractableCardGroupContext.Provider value={{ select, isSelected }}>
      <FlexLayout className={clsx("interactableCardGroup", className)}>
        {children}
      </FlexLayout>
    </InteractableCardGroupContext.Provider>
  );
};
