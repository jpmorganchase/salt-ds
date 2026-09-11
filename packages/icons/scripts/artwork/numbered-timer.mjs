import { S, textLabel } from "./primitives.mjs";

// Both directions share the circle and number anchor. The arrowhead sits
// above the number's cap line, preserving clearance at the authored width.
export const numberedTimer = (seconds, direction) => {
  const centerX = 12;
  const centerY = 12.75;
  const radius = 9;
  const tipY = 7.5;
  const arm = 3.75;
  const sign = direction === "forward" ? 1 : -1;
  const tipX = centerX + sign * Math.sqrt(radius ** 2 - (tipY - centerY) ** 2);
  const endX = centerX + sign * radius;
  const sweep = direction === "forward" ? 0 : 1;
  return (
    S(
      `M${tipX} ${tipY}A${radius} ${radius} 0 1 ${sweep} ${endX} ${centerY}M${tipX} ${tipY - arm}V${tipY}H${tipX - sign * arm}`,
    ) +
    textLabel(seconds, centerX, centerY, 6.3, {
      align: "center",
      verticalAlign: "center",
    })
  );
};
