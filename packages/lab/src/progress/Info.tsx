export interface InfoProps {
  className: string;
  unit: string;
  value: number;
}

export const Info = ({ className, value, unit }: InfoProps) => {
  return (
    <span aria-hidden="true" className={className}>
      {value}
      {unit}
    </span>
  );
};
