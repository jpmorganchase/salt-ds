import React from "react";

export interface InfoProps {
  className: string;
  unit: string;
  value: number;
}

export const Info: React.FC<InfoProps> = ({ className, value, unit }) => {
  return (
    <span aria-hidden="true" className={className}>
      {value}
      {unit}
    </span>
  );
};
