import "./CornerTag.css";

export interface CornerTagProps {
  focusOnly?: boolean; // Show when the parent is focused, hide when not
}

export function CornerTag(props: CornerTagProps) {
  return (
    <div
      className={
        props.focusOnly ? "saltGridCornerTag-focusOnly" : "saltGridCornerTag"
      }
    />
  );
}
