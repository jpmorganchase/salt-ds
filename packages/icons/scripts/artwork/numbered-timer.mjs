import { S, textLabel } from "./primitives.mjs";

const point = ([x, y]) => `${Number(x.toFixed(6))} ${Number(y.toFixed(6))}`;

// Tangent fillets use the actual circular track, not a straight proxy for its
// endpoint tangent. Their filled patches prevent thin-width pinholes. The
// short timer head permits a smaller radius than the long directional arrows.
function timerHeadRoots(cx, cy, radius, tipX, tipY, sign, arm) {
  const tip = [tipX, tipY];
  const tangent = [sign * (tipY - cy), -sign * (tipX - cx)];
  const fillet = 1.35;
  return [[0, -1], [-sign, 0]].map((ray) => {
    const side = Math.sign(ray[0] * tangent[1] - ray[1] * tangent[0]);
    const normal = [-ray[1] * side, ray[0] * side];
    const offset = [tipX - cx + fillet * normal[0], tipY - cy + fillet * normal[1]];
    const projection = ray[0] * offset[0] + ray[1] * offset[1];
    const candidates = [-1, 1].flatMap((relation) => {
      const distance = radius + relation * fillet;
      const discriminant = projection ** 2 - (offset[0] ** 2 + offset[1] ** 2 - distance ** 2);
      if (discriminant < 0) return [];
      return [-1, 1].map((root) => {
        const run = -projection + root * Math.sqrt(discriminant);
        const line = [tipX + run * ray[0], tipY + run * ray[1]];
        const center = [line[0] + fillet * normal[0], line[1] + fillet * normal[1]];
        const circle = [cx + radius * (center[0] - cx) / distance, cy + radius * (center[1] - cy) / distance];
        return { run, line, center, circle };
      }).filter(({run}) => run > 0 && run < arm);
    });
    const candidate = candidates.sort((a, b) => a.run - b.run)[0];
    if (!candidate) throw new Error("Timer head lacks tangent clearance");
    const {line, center, circle} = candidate;
    const sweep = (line[0] - center[0]) * (circle[1] - center[1]) -
      (line[1] - center[1]) * (circle[0] - center[0]) > 0 ? 1 : 0;
    const returnSweep = (circle[0] - cx) * (tipY - cy) -
      (circle[1] - cy) * (tipX - cx) > 0 ? 1 : 0;
    const arc = `M${point(line)}A${fillet} ${fillet} 0 0 ${sweep} ${point(circle)}`;
    return `<path d="${arc}A${radius} ${radius} 0 0 ${returnSweep} ${point(tip)}Z" fill="currentColor" stroke="none"/>` + S(arc);
  }).join("");
}

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
    timerHeadRoots(centerX, centerY, radius, tipX, tipY, sign, arm) +
    textLabel(seconds, centerX, centerY, 6.3, {
      align: "center",
      verticalAlign: "center",
    })
  );
};
