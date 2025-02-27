import "./Separators.css";
export function HorizontalSeparator({
                                      variant = "primary",
                                    }: {
  variant?: "primary" | "secondary" | "tertiary";
}) {
  return <div className={`horizontalSeparator ${variant}`} />;
}
