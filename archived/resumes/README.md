# Resume Automation & Integration with claudewill.io

## Project Overview
This project is evolving into a unified, web-based resume builder and admin/editor, fully integrated with your personal site at [claudewill.io](https://claudewill.io). The goal is to enable rapid, high-quality, and highly customized resume generation for any job application, with a seamless workflow for updating your master data and deploying public/private resume pages.

## Key Features & Goals
- **Master Data Source:** All experience, skills, education, certifications, and achievements are stored in a structured YAML (or Markdown) file for easy updates and automation.
- **Custom Resume Generation:** For each job, select which sections/roles to include and instantly generate a styled HTML (and optionally PDF) resume.
- **Web-Based Admin/Editor:** (Planned) A secure, web-based interface for editing your master data, selecting sections, and generating resumes on the fly.
- **Public Resume Page:** `/resume` on claudewill.io will always display your most up-to-date, canonical resume.
- **Private/Admin Tools:** `/resume/admin` (or similar) will be protected for your use only, allowing you to update data and generate custom resumes.
- **Consistent Branding:** All resume pages and tools will share the claudewill.io look and feel.
- **Easy Maintenance:** One codebase, one deployment pipeline, and a future-proof structure for adding new features (portfolio, blog, testimonials, etc.).

## Current Workflow (MVP)
1. **Edit your master YAML or Markdown file** with all your data.
2. **Use a Python script** to select sections and generate a custom HTML resume for each job.
3. **Export to PDF** via browser print if needed.
4. **(Planned) Web-based admin/editor** for even faster, more flexible resume creation.

## Next Steps
- Merge this repository with your main claudewill.io repo for unified development and deployment.
- Scaffold `/resume` and `/resume/admin` routes/pages in your web project.
- Continue refining your master data and resume templates for maximum impact.
- Build out the web-based admin/editor as time allows.

## For Tomorrow
- Review this README and the current repo structure.
- Decide on any additional features or changes you want to prioritize.
- Begin the merge and integration process with claudewill.io.
- Continue iterating on your master data and resume output for upcoming applications.

---

**This README is your living project brief. Update it as your workflow and goals evolve!**
