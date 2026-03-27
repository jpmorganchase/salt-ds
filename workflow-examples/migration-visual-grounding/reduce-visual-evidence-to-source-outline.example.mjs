process.stdin.setEncoding("utf8");

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});

function unique(values) {
  return Array.from(
    new Set(
      values.filter((value) => typeof value === "string" && value.length > 0),
    ),
  );
}

process.stdin.on("end", () => {
  const payload = JSON.parse(input);
  const entries = Array.isArray(payload.visual_evidence)
    ? payload.visual_evidence
    : [];
  const sourceOutline = {
    regions: unique(
      entries.flatMap((entry) => entry?.derived_outline?.regions ?? []),
    ),
    actions: unique(
      entries.flatMap((entry) => entry?.derived_outline?.actions ?? []),
    ),
    states: unique(
      entries.flatMap((entry) => entry?.derived_outline?.states ?? []),
    ),
    notes: unique([
      ...entries.flatMap((entry) => entry?.derived_outline?.notes ?? []),
      ...(Array.isArray(payload.ambiguities) ? payload.ambiguities : []),
    ]),
  };

  process.stdout.write(`${JSON.stringify(sourceOutline, null, 2)}\n`);
});
