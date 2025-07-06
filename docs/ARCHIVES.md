# Archives Documentation

## Overview
The `archived/` directory contains historical projects, legacy implementations, and development artifacts that are no longer actively maintained but preserved for reference.

## Structure

### `/archived/resume-engine/`
- **Purpose**: Original resume generation and ATS optimization system
- **Status**: Superseded by Career Intelligence platform
- **Contents**: React components, resume templates, generated PDFs
- **Note**: Contains valuable resume data and templates for reference

### `/archived/resume-engine-legacy/`
- **Purpose**: Earlier iteration of resume engine with full React setup
- **Status**: Replaced by simplified static version
- **Contents**: Complete React app with Vite, package.json, src/ directory
- **Note**: Full-featured implementation with advanced components

### `/archived/ats-decoder/` & `/archived/ats-decoder-legacy/`
- **Purpose**: ATS (Applicant Tracking System) analysis tools
- **Status**: Functionality integrated into Career Intelligence platform
- **Contents**: HTML tools, documentation, project summaries
- **Note**: Research and development artifacts

### `/archived/resumes/`
- **Purpose**: Generated resumes, cover letters, and templates
- **Status**: Historical outputs from various resume systems
- **Contents**: PDF files, HTML templates, markdown sources
- **Note**: Examples of system outputs and formatting

### `/archived/legacy-resumes/`
- **Purpose**: Python-based resume generation scripts
- **Status**: Replaced by React-based systems
- **Contents**: Python scripts, requirements.txt, test files
- **Note**: Original automation approach

## Migration Notes

### What Was Moved
- All resume-engine implementations and outputs
- ATS decoder tools and documentation
- Legacy Python resume generators
- Generated PDFs and templates
- Development artifacts and planning documents

### What Remains Active
- Main site (root HTML/CSS/JS)
- Career Intelligence platform (`packages/career-intelligence/`)
- Basketball app (`basketball/`)
- Documentation (`docs/`)
- Shared assets (`css/`, `js/`)

## Access Patterns
- **For reference**: Browse archived content for templates, examples, or implementation patterns
- **For development**: Do not modify archived content; create new implementations in active areas
- **For cleanup**: Archived content may be moved to separate repository or branch in future

## Git LFS Note
Large binary files (PDFs, images) in archived content should be tracked with Git LFS when available to reduce repository size for new contributors. 