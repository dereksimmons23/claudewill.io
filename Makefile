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

.PHONY: deploy fix test quick status

# Deploy with a custom message
deploy:
	@echo "🚀 Deploying with message: $(MSG)"
	npm run precommit
	git add .
	git commit -m "$(MSG)"
	git push origin main

# Auto-fix linting issues
fix:
	@echo "🔧 Auto-fixing linting errors..."
	npm run lint:css -- --fix
	npm run lint:js -- --fix

# Test locally with live reload
test:
	@echo "🧪 Starting local test server..."
	npm run precommit
	npm run dev

# Quick deploy with auto-generated message
quick:
	@echo "⚡ Quick deploying with auto-fixes..."
	npm run quick-deploy

# Check git and linting status
status:
	@echo "📋 Git Status:"
	git status --short
	@echo "\n🔍 CSS Lint Status:"
	npm run lint:css || echo "❌ CSS errors found"
	@echo "\n📝 JS Lint Status:"
	npm run lint:js || echo "❌ JS errors found"

# Usage examples:
# make deploy MSG="fix assessment tool"
# make fix
# make test  
# make quick
# make status

.PHONY: all pdf html tex clean deploy fix test quick status
