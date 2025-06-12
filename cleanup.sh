#!/bin/bash

# claudewill.io Cleanup Script
# Organizes project structure while preserving active work

echo "🧹 Starting claudewill.io cleanup..."
echo "📁 Current directory: $(pwd)"

# Navigate to the claudewill.io directory
cd /Users/dereksimmons/Desktop/claudewill.io

# Create organized archive structure
echo "📁 Creating archive directories..."
mkdir -p archived/resume-engine-dev
mkdir -p archived/legacy-resumes
mkdir -p archived/old-cover-letters
mkdir -p archived/duplicate-docs

# Move Resume Engine development artifacts
echo "📦 Archiving resume engine development docs..."
mv resume-engine/FAILURE_CASE_STUDY.md archived/resume-engine-dev/ 2>/dev/null
mv resume-engine/V2_ARCHITECTURE.md archived/resume-engine-dev/ 2>/dev/null
mv resume-engine/V2_DEVELOPMENT_SUMMARY.md archived/resume-engine-dev/ 2>/dev/null
mv resume-engine/V2_SPRINT_PLAN.md archived/resume-engine-dev/ 2>/dev/null
mv resume-engine/V2_TRACKING_TEMPLATE.md archived/resume-engine-dev/ 2>/dev/null
mv resume-engine/week1_tracking_template.md archived/resume-engine-dev/ 2>/dev/null

# Move legacy resume files
echo "📦 Archiving legacy resume files..."
mv resumes/derek_3m_resume.html archived/legacy-resumes/ 2>/dev/null
mv resumes/derek_3m_resume.md archived/legacy-resumes/ 2>/dev/null
mv resumes/derek_macalester_resume.html archived/legacy-resumes/ 2>/dev/null
mv resumes/derek_simmons_3m_resume.html archived/legacy-resumes/ 2>/dev/null
mv resumes/generator.py archived/legacy-resumes/ 2>/dev/null
mv resumes/quick_generate.py archived/legacy-resumes/ 2>/dev/null
mv resumes/resume_generator_v2.py archived/legacy-resumes/ 2>/dev/null
mv resumes/test_system.py archived/legacy-resumes/ 2>/dev/null
mv resumes/requirements.txt archived/legacy-resumes/ 2>/dev/null

# Move old cover letters to organized structure
echo "📦 Organizing cover letters..."
mv "resumes/cover letters/Cover-Letter-Deloitte-2025-05-25.pdf" archived/old-cover-letters/ 2>/dev/null
mv "resumes/cover letters/Cover-Letter-Deloitte-2025-05-25.txt" archived/old-cover-letters/ 2>/dev/null
mv "resumes/cover letters/derek_macalester_cover_letter.md" archived/old-cover-letters/ 2>/dev/null
mv "resumes/cover letters/derek_macalester_cover_letter.pdf" archived/old-cover-letters/ 2>/dev/null
mv "resumes/cover letters/better-collective-cover-letter.md" archived/old-cover-letters/ 2>/dev/null
mv "resumes/cover letters/sports-background-cover-letter.md" archived/old-cover-letters/ 2>/dev/null

# Move duplicate documentation
echo "📦 Archiving duplicate documentation..."
mv resumes/resume_project_handoff.md archived/duplicate-docs/ 2>/dev/null
mv resumes/README_v2.md archived/duplicate-docs/ 2>/dev/null
mv resumes/week1_tracking_template.md archived/duplicate-docs/ 2>/dev/null

# Remove empty temp directories
echo "🗑️  Removing empty temp directories..."
rmdir .tmp.driveupload 2>/dev/null
rmdir .tmp.drivedownload 2>/dev/null

# Remove system files
echo "🗑️  Removing system files..."
find . -name ".DS_Store" -delete 2>/dev/null

# Create summary of current active structure
echo "📋 Creating structure summary..."
cat > CURRENT_STRUCTURE.md << 'EOF'
# claudewill.io Current Structure

## 🚀 Active Projects
- `/pages/` - Website pages (portfolio, projects, about, contact)
- `/resume-engine/` - React-based resume generation system
- `/css/` & `/js/` - Website styling and functionality

## 📄 Current Resume Assets
- `/resumes/derek-simmons-resume.txt` - Latest generated resume
- `/resumes/Derek Simmons - Resume.pdf` - Current PDF version
- `/resumes/derek_resume_redesign.html` - Clean HTML version
- `/resumes/derek_resume_system.md` - Master resume system
- `/resumes/resume-card-components.json` - Active card system

## 📬 Active Cover Letters
- `/resumes/cover letters/Mayo Clinic Cover Letter.md` - Healthcare positioning
- `/resumes/cover letters/AI-Creative-Anthropic-Cover-Letter.md` - AI/Creative positioning
- `/resumes/cover letters/AI-tech focused cover letter.md` - Tech positioning

## 📚 Documentation
- `resume_project_handoff_updated.md` - Latest project status
- `/resumes/BEST_PRACTICES.md` - Resume best practices
- `/resumes/resume-journey-summary.md` - Development history

## 🗃️ Archived
- `/archived/resume-engine-dev/` - Development artifacts
- `/archived/legacy-resumes/` - Old resume versions and Python scripts
- `/archived/old-cover-letters/` - Previous application materials
- `/archived/duplicate-docs/` - Superseded documentation

## 🎯 Next Actions
- Resume engine is production ready
- Current resume assets are deployment ready
- Archive contains development history for reference
EOF

# Display cleanup summary
echo ""
echo "✅ Cleanup Complete!"
echo ""
echo "📊 Summary:"
echo "  📁 Created organized archive structure"
echo "  📦 Moved $(find archived/ -type f | wc -l | xargs) files to archive"
echo "  🗑️  Removed temp directories and system files"
echo "  📋 Created CURRENT_STRUCTURE.md guide"
echo ""
echo "🎯 Active Structure:"
echo "  ✅ Website: pages/, css/, js/"
echo "  ✅ Resume Engine: resume-engine/src/"
echo "  ✅ Current Resumes: resumes/derek-simmons-resume.txt"
echo "  ✅ Active Cover Letters: resumes/cover letters/"
echo "  ✅ Documentation: resume_project_handoff_updated.md"
echo ""
echo "🗃️  Archived: $(find archived/ -type f | wc -l | xargs) development files preserved in /archived/"
echo ""
echo "🚀 Your project is now clean and organized!"
