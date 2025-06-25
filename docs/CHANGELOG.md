# Changelog

## [Current] - 2025-01-24

### Added
- AI Readiness Assessment tool with interactive scoring and profile results
- Single-page assessment format with progress tracking
- Real-time option selection and button enabling
- Netlify form integration for assessment result tracking
- Google Analytics event tracking for assessment completions
- Claude Will Widget functionality with proactive messaging and mobile optimization

### Fixed
- Assessment functionality - options now selectable and results display properly
- CSS linting errors by reorganizing selectors by specificity order
- Broken file references after documentation reorganization
- GitHub Actions deployment pipeline - re-enabled CSS linting after fixes
- Mobile responsiveness improvements for assessment interface
- Google Analytics ID consistency across all pages (G-991ML96NJ3)
- Assessment link path corrected from `/assessment` to `assessment.html`
- Documentation file organization (moved graphTD.mmd to docs/internal/)

### Changed
- Moved internal documentation to `docs/internal/` directory
- Updated all internal file references to new locations
- Reorganized CSS structure for better maintainability
- Improved error handling in assessment JavaScript
- Re-enabled CSS linting in GitHub Actions workflow

### Technical
- Fixed `.hamburger-nav a:hover` vs `body.dark-theme footer a:hover` specificity ordering
- Added comprehensive debugging to assessment script
- Resolved duplicate CSS selectors and cascade issues
- Implemented comprehensive Claude Will Widget with context-aware messaging
- Enhanced mobile UX with proper viewport handling and touch optimizations

## Previous Changes
[Previous changelog entries would go here from earlier development]

---
