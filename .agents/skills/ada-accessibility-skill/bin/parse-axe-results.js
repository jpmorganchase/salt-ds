#!/usr/bin/env node
/**
 * parse-axe-results.js — Compact parser for axe-core/cli JSON output
 *
 * Extracts violation data needed by the accessibility agent,
 * reducing ~10,000+ line JSON files to compact output.
 *
 * Usage:
 *   node parse-axe-results.js <file>                    Parse violations
 *   node parse-axe-results.js --compare <base> <val>    Compare two scans
 */

const fs = require("fs");
const args = process.argv.slice(2);

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`Error reading ${filePath}: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Parse a single axe results file — extract violations only.
 * Prints compact JSON: { totalViolations, pages: [{ url, violations }] }
 */
function parse(filePath) {
  const data = readJSON(filePath);
  let totalViolations = 0;

  const pages = data.map((page) => {
    const violations = page.violations.map((v) => {
      totalViolations += v.nodes.length;
      return {
        id: v.id,
        impact: v.impact,
        tags: v.tags,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map((n) => ({
          html: n.html,
          target: Array.isArray(n.target) ? n.target.join(", ") : n.target,
          failureSummary: n.failureSummary,
          impact: n.impact,
        })),
      };
    });
    return { url: page.url, violations };
  });

  console.log(JSON.stringify({ totalViolations, pages }, null, 2));
}

/**
 * Compare baseline (Phase 1) vs validation (Phase 3) results.
 * Classifies each finding by rule ID + URL as resolved, remaining, or new.
 * Prints compact JSON with summary counts and per-category details.
 */
function compare(baselinePath, validationPath) {
  const baseline = readJSON(baselinePath);
  const validation = readJSON(validationPath);

  // Index findings by ruleId|url
  const baseMap = new Map();
  for (const page of baseline) {
    for (const v of page.violations) {
      baseMap.set(`${v.id}|${page.url}`, {
        id: v.id,
        url: page.url,
        impact: v.impact,
        tags: v.tags,
        nodeCount: v.nodes.length,
      });
    }
  }

  const valMap = new Map();
  for (const page of validation) {
    for (const v of page.violations) {
      valMap.set(`${v.id}|${page.url}`, {
        id: v.id,
        url: page.url,
        impact: v.impact,
        tags: v.tags,
        description: v.description,
        help: v.help,
        nodeCount: v.nodes.length,
        nodes: v.nodes.map((n) => ({
          html: n.html,
          target: Array.isArray(n.target) ? n.target.join(", ") : n.target,
          failureSummary: n.failureSummary,
          impact: n.impact,
        })),
      });
    }
  }

  const resolved = [];
  const remaining = [];
  const newFindings = [];

  for (const [key, f] of baseMap) {
    if (valMap.has(key)) {
      remaining.push({
        ...f,
        validationNodeCount: valMap.get(key).nodeCount,
      });
    } else {
      resolved.push(f);
    }
  }

  for (const [key, f] of valMap) {
    if (!baseMap.has(key)) {
      newFindings.push(f);
    }
  }

  console.log(
    JSON.stringify(
      {
        summary: {
          resolved: resolved.length,
          remaining: remaining.length,
          new: newFindings.length,
        },
        resolved,
        remaining,
        new: newFindings,
      },
      null,
      2
    )
  );
}

// --- Main ---
if (args[0] === "--compare" && args.length === 3) {
  compare(args[1], args[2]);
} else if (args.length === 1 && args[0] !== "--help") {
  parse(args[0]);
} else {
  console.log("Usage:");
  console.log(
    "  node parse-axe-results.js <file>                 Parse violations from axe JSON"
  );
  console.log(
    "  node parse-axe-results.js --compare <base> <val> Compare baseline vs validation"
  );
  process.exit(args[0] === "--help" ? 0 : 2);
}
