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

.PHONY: all pdf html tex clean
