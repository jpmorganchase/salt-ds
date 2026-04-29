# Changelog

All notable changes to the ADA Accessibility Skill will be documented in this file.

## [2.0.0] - 2026-04-17

### Added
- Automated scanning with @axe-core/cli for rendered DOM analysis
- On-demand installation guide for @axe-core/cli when not already installed
- Validation re-scan to confirm applied fixes resolved detected issues
- Session continuation — returning users can load previous results and resume
- Support for 3 new checkpoints: 1.3.1-28, 3.1.1-02, 3.1.2-02
- Sub-agent orchestrator architecture with single-agent fallback
- Scan artifact lifecycle — archive or delete previous results before re-scanning
- Per-fix targeted validation during interactive remediation
- Context-aware inference for checkpoint assignment

### Changed
- Expanded scope from 6 to 9 DAKB checkpoints
- Restructured reference docs into `references/` with conditional on-demand loading
- Streamlined startup question flow from 4 questions to 2
- Moved a11y.md to skill's `scans/` directory for portable tracking

## [1.0.1] - 2026-04-01

### Added
- Auto-update capability - skill checks for updates automatically
- Simple "Update now?" prompt when new version available
- Automatic upgrade via git pull or clone

### Changed
- Streamlined SKILL.md for clarity and brevity

## [1.0.0] - 2026-03-31

### Added
- Initial release of ADA Accessibility Remediation Agent
- Support for 5 core WCAG 2.1 accessibility issues (6 DAKB Checkpoints):
  - Missing Alt Text (1.1.1-01)
  - Missing Language Attributes (3.1.1-01, 3.1.2-01)
  - Empty/Non-Descriptive Links (2.4.4-01)
  - Empty Buttons (4.1.2-03)
  - Missing Form Labels (1.3.1-37)
- Deterministic fixing approach with manual review flagging
- Salt Design System integration
- Usage tracking for analytics

### Features
- Scans codebase for accessibility issues
- Provides detailed verification checklist
- Flags ambiguous cases for manual review
- Preserves existing implementations
