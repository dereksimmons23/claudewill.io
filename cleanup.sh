#!/bin/bash

# claudewill.io Enhanced Cleanup Script
# Organizes project structure while preserving active work
# Adds safety, dry-run, logging, and parameterization for concurrent environments

set -e

LOCKFILE="/tmp/claudewill_cleanup.lock"
LOGFILE="cleanup.log"
BASE_DIR="${1:-$(pwd)}"
DRY_RUN=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      ;;
    --base-dir=*)
      BASE_DIR="${arg#*=}"
      ;;
  esac
done

exec 200>$LOCKFILE
flock -n 200 || { echo "Another cleanup is running. Exiting."; exit 1; }

cd "$BASE_DIR" || { echo "Could not cd to $BASE_DIR"; exit 1; }

echo "🧹 Starting claudewill.io cleanup..." | tee -a "$LOGFILE"
echo "📁 Current directory: $(pwd)" | tee -a "$LOGFILE"
if $DRY_RUN; then
  echo "🔎 Running in dry-run mode. No files will be moved or deleted." | tee -a "$LOGFILE"
fi

# Helper function for dry-run and logging
move_file() {
  SRC="$1"
  DEST="$2"
  if [ -f "$SRC" ]; then
    if $DRY_RUN; then
      echo "Would move $SRC to $DEST" | tee -a "$LOGFILE"
    else
      mv "$SRC" "$DEST" && echo "Moved $SRC to $DEST" | tee -a "$LOGFILE"
    fi
  fi
}

mkdir -p archived/resume-engine-dev archived/legacy-resumes archived/old-cover-letters archived/duplicate-docs

# Resume Engine dev artifacts
move_file resume-engine/FAILURE_CASE_STUDY.md archived/resume-engine-dev/
move_file resume-engine/V2_ARCHITECTURE.md archived/resume-engine-dev/
move_file resume-engine/V2_DEVELOPMENT_SUMMARY.md archived/resume-engine-dev/
move_file resume-engine/V2_SPRINT_PLAN.md archived/resume-engine-dev/
move_file resume-engine/V2_TRACKING_TEMPLATE.md archived/resume-engine-dev/
move_file resume-engine/week1_tracking_template.md archived/resume-engine-dev/

# Legacy resumes
move_file resumes/derek_3m_resume.html archived/legacy-resumes/
move_file resumes/derek_3m_resume.md archived/legacy-resumes/
move_file resumes/derek_macalester_resume.html archived/legacy-resumes/
move_file resumes/derek_simmons_3m_resume.html archived/legacy-resumes/
move_file resumes/generator.py archived/legacy-resumes/
move_file resumes/quick_generate.py archived/legacy-resumes/
move_file resumes/resume_generator_v2.py archived/legacy-resumes/
move_file resumes/test_system.py archived/legacy-resumes/
move_file resumes/requirements.txt archived/legacy-resumes/

# Old cover letters
move_file "resumes/cover letters/Cover-Letter-Deloitte-2025-05-25.pdf" archived/old-cover-letters/
move_file "resumes/cover letters/Cover-Letter-Deloitte-2025-05-25.txt" archived/old-cover-letters/
move_file "resumes/cover letters/derek_macalester_cover_letter.md" archived/old-cover-letters/
move_file "resumes/cover letters/derek_macalester_cover_letter.pdf" archived/old-cover-letters/
move_file "resumes/cover letters/better-collective-cover-letter.md" archived/old-cover-letters/
move_file "resumes/cover letters/sports-background-cover-letter.md" archived/old-cover-letters/

# Duplicate docs
move_file resumes/resume_project_handoff.md archived/duplicate-docs/
move_file resumes/README_v2.md archived/duplicate-docs/
move_file resumes/week1_tracking_template.md archived/duplicate-docs/

# Remove empty temp directories
for d in .tmp.driveupload .tmp.drivedownload; do
  if [ -d "$d" ]; then
    if $DRY_RUN; then
      echo "Would remove empty directory $d" | tee -a "$LOGFILE"
    else
      rmdir "$d" 2>/dev/null && echo "Removed empty directory $d" | tee -a "$LOGFILE"
    fi
  fi

done

# Remove system files
if $DRY_RUN; then
  echo "Would delete .DS_Store files" | tee -a "$LOGFILE"
else
  find . -name ".DS_Store" -delete 2>/dev/null && echo "Deleted .DS_Store files" | tee -a "$LOGFILE"
fi

# Backup option (uncomment to enable)
# if ! $DRY_RUN; then
#   tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz .
#   echo "Backup created." | tee -a "$LOGFILE"
# fi

# Create structure summary
if ! $DRY_RUN; then
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
fi

# Display cleanup summary
ARCHIVED_COUNT=$(find archived/ -type f | wc -l | xargs)
echo "" | tee -a "$LOGFILE"
echo "✅ Cleanup Complete!" | tee -a "$LOGFILE"
echo "" | tee -a "$LOGFILE"
echo "📊 Summary:" | tee -a "$LOGFILE"
echo "  📁 Created organized archive structure" | tee -a "$LOGFILE"
echo "  📦 Moved $ARCHIVED_COUNT files to archive" | tee -a "$LOGFILE"
echo "  🗑️  Removed temp directories and system files" | tee -a "$LOGFILE"
echo "  📋 Created CURRENT_STRUCTURE.md guide" | tee -a "$LOGFILE"
echo "" | tee -a "$LOGFILE"
echo "🎯 Active Structure:" | tee -a "$LOGFILE"
echo "  ✅ Website: pages/, css/, js/" | tee -a "$LOGFILE"
echo "  ✅ Resume Engine: resume-engine/src/" | tee -a "$LOGFILE"
echo "  ✅ Current Resumes: resumes/derek-simmons-resume.txt" | tee -a "$LOGFILE"
echo "  ✅ Active Cover Letters: resumes/cover letters/" | tee -a "$LOGFILE"
echo "  ✅ Documentation: resume_project_handoff_updated.md" | tee -a "$LOGFILE"
echo "" | tee -a "$LOGFILE"
echo "🗃️  Archived: $ARCHIVED_COUNT development files preserved in /archived/" | tee -a "$LOGFILE"
echo "" | tee -a "$LOGFILE"
echo "🚀 Your project is now clean and organized!" | tee -a "$LOGFILE"
