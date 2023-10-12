import { Text } from "@salt-ds/core";
export interface InfoProps {
  className: string;
  unit: string;
  value: number;
}

export const Info = ({ className, value, unit }: InfoProps) => {
  return (
    <Text styleAs="display3" className={className}>
      {value}
      {unit}
    </Text>
  );
};
