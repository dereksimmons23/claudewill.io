# Makefile for Claude Will project
# Common documentation and resume tasks

# Variables
PANDOC=pandoc
LATEX=pdflatex
RESUME_MD=docs/resume.md
RESUME_PDF=docs/Derek_Simmons_Resume.pdf
RESUME_HTML=docs/Derek_Simmons_Resume.html
RESUME_TEX=docs/Derek_Simmons_Resume.tex
RESUME_TEMPLATE=docs/resume.template
RESUME_HTML_TEMPLATE=docs/resume-html.template

# Default target
all: pdf html

# Build PDF resume from Markdown
pdf:
	$(PANDOC) $(RESUME_MD) -o $(RESUME_PDF) --template=$(RESUME_TEMPLATE) --pdf-engine=xelatex

# Build HTML resume from Markdown
html:
	$(PANDOC) $(RESUME_MD) -o $(RESUME_HTML) --template=$(RESUME_HTML_TEMPLATE)

# Build LaTeX (for debugging)
tex:
	$(PANDOC) $(RESUME_MD) -o $(RESUME_TEX) --template=$(RESUME_TEMPLATE)

# Clean generated files
clean:
	rm -f $(RESUME_PDF) $(RESUME_HTML) $(RESUME_TEX)

.PHONY: deploy fix test quick status dev-deploy prod-deploy dev-test

# PRODUCTION DEPLOYMENT (main branch only)
deploy:
	@if [ "$$(git branch --show-current)" != "main" ]; then \
		echo "❌ ERROR: Production deploy only allowed from main branch"; \
		echo "💡 Use 'make dev-deploy' for development or 'make prod-deploy' to merge and deploy"; \
		exit 1; \
	fi
	@echo "🚀 PRODUCTION Deploying with message: $(MSG)"
	npm run precommit
	git add .
	git commit -m "$(MSG)"
	git push origin main

# DEVELOPMENT DEPLOYMENT (dev branch)
dev-deploy:
	@if [ "$$(git branch --show-current)" != "dev" ]; then \
		echo "❌ ERROR: Please switch to dev branch first: git checkout dev"; \
	fi
	@echo "🧪 DEV Deploying with message: $(MSG)"
	npm run precommit
	git add .
	git commit -m "$(MSG)"
	git push origin dev

# PRODUCTION DEPLOYMENT (merge dev to main and deploy)
prod-deploy:
	@echo "🔄 Merging dev to main and deploying..."
	git checkout main
	git merge dev
	npm run precommit
	git push origin main
	git checkout dev
	@echo "✅ Deployed to production and returned to dev branch"

# DEVELOPMENT TESTING (safer local testing)
dev-test:
	@echo "🧪 Starting DEV test server..."
	@if [ "$$(git branch --show-current)" != "dev" ]; then \
		echo "⚠️  WARNING: Not on dev branch. Switch with: git checkout dev"; \
	fi
	npm run precommit
	npm run dev

# Auto-fix linting issues
fix:
	@echo "🔧 Auto-fixing linting errors..."
	npm run lint:css -- --fix
	npm run lint:js -- --fix

# Test locally with live reload (legacy - use dev-test instead)
test:
	@echo "🧪 Starting local test server..."
	npm run precommit
	npm run dev

# Quick deploy with auto-generated message (DEVELOPMENT ONLY)
quick:
	@if [ "$$(git branch --show-current)" = "main" ]; then \
		echo "❌ ERROR: Quick deploy not allowed on main branch"; \
		echo "💡 Switch to dev branch: git checkout dev"; \
		exit 1; \
	fi
	@echo "⚡ Quick DEV deploying with auto-fixes..."
	npm run quick-deploy

# Check git and linting status
status:
	@echo "📋 Current Branch: $$(git branch --show-current)"
	@echo "📋 Git Status:"
	git status --short
	@echo "\n🔍 CSS Lint Status:"
	npm run lint:css || echo "❌ CSS errors found"
	@echo "\n📝 JS Lint Status:"
	npm run lint:js || echo "❌ JS errors found"

# Usage examples:
# DEVELOPMENT:
# make dev-deploy MSG="test navigation fixes"
# make dev-test
# make quick (on dev branch only)
#
# PRODUCTION:
# make prod-deploy (merges dev to main and deploys)
# make deploy MSG="final navigation fix" (main branch only)
#
# GENERAL:
# make fix
# make status

.PHONY: all pdf html tex clean deploy fix test quick status dev-deploy prod-deploy dev-test
