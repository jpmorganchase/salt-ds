# a11y.md File Skeleton

**Use when:** Creating a fresh `a11y.md` file for a new accessibility scan.
For protocol rules (status values, write access, dedup), see `protocols/a11y_file_protocol.md`.

**Do NOT populate the Scan History section during skeleton creation.** The Scan History entry is written by the main agent only after all phases complete, using `templates/scan_history_template.md`.

---

## Skeleton

```markdown
# Accessibility Scan Results — [Project Name]

## Scan Metadata
- Date: [timestamp]
- Skill version: [from VERSION file]
- Scan mode: [Full (aXe + Agent review) / Agent only]
- Q1 - Skill update: [Checked (up to date) / Checked (updated to vX.X.X) / Skipped]
- Q2 - Automated scanning: [Run it (already installed) / Installed and ran / Skipped]
- Dev server: [Auto-detected at <URL> / Started via <command> at <URL> / Not applicable]
- Frontend directory: [path, e.g., src/ — auto-detected or developer-specified]
- Framework: [auto-detected, e.g., React]
- Design system: [auto-detected, e.g., Salt DS / none]
- Package manager: [auto-detected, e.g., npm]
- Phase 1 URLs scanned: [list of URLs, or "N/A" if Phase 1 skipped]
- Phase 1 result: [N violations detected | 0 violations detected | Skipped: reason]

## Findings

## Best Practice Recommendation

## False Positives

## Not Applicable / Skipped

## Scan History
```
