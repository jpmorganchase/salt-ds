process.stdin.setEncoding("utf8");

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});

process.stdin.on("end", () => {
  const request = JSON.parse(input);

  const visualEvidence = request.inputs.map((entry) => {
    if (entry.kind === "screenshot") {
      return {
        kind: entry.kind,
        source_type: entry.source_type,
        source: entry.source,
        label: entry.label,
        derived_outline: {
          regions: ["toolbar"],
          actions: ["Refresh"],
          notes: [
            "Screenshot-only interpretation is approximate and should be confirmed against runtime.",
          ],
        },
        confidence: "low",
        notes: [
          "The screenshot is sufficient for provisional action hierarchy, not final sign-off.",
        ],
      };
    }

    return {
      kind: entry.kind,
      source_type: entry.source_type,
      source: entry.source,
      label: entry.label,
      derived_outline: {
        regions: ["header", "sidebar", "content"],
        actions: ["Save", "Cancel"],
        states: ["loading", "empty"],
        notes: ["Preserve the mockup action order in the first Salt pass."],
      },
      confidence: "high",
      notes: [
        "Mockup structure is stable enough for the first migration pass.",
      ],
    };
  });

  process.stdout.write(
    JSON.stringify({
      contract: "migrate_visual_evidence_v1",
      visual_evidence: visualEvidence,
      ambiguities: [
        "Confirm low-confidence screenshot landmarks against runtime before implementation is finalized.",
      ],
    }),
  );
});
