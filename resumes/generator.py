import sys
import os
import frontmatter
import markdown
from jinja2 import Environment, FileSystemLoader

# Paths
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), 'templates')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def main():
    if len(sys.argv) < 2:
        print("Usage: python generator.py <resume_markdown_file>")
        sys.exit(1)
    md_path = sys.argv[1]
    if not os.path.isfile(md_path):
        print(f"File not found: {md_path}")
        sys.exit(1)
    # Load markdown with frontmatter
    post = frontmatter.load(md_path)
    # Convert markdown body to HTML
    html_body = markdown.markdown(post.content)
    # Load HTML template
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
    template = env.get_template('resume-html.template')
    # Render HTML
    html = template.render(**post.metadata, body=html_body)
    # Output file name
    base_name = os.path.splitext(os.path.basename(md_path))[0]
    out_path = os.path.join(OUTPUT_DIR, f"{base_name}.html")
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Generated HTML: {out_path}")

if __name__ == "__main__":
    main()
