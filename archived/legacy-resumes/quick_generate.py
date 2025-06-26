#!/usr/bin/env python3
"""
Quick Resume Generator CLI for Derek Simmons
Usage: python quick_generate.py "job description text" "Company Name" "Role Title"
"""

import sys
import os
from resume_generator_v2 import ResumeCardSystem, CoverLetterGenerator, generate_formatted_resume

def main():
    if len(sys.argv) < 4:
        print("Usage: python quick_generate.py 'job description' 'Company Name' 'Role Title'")
        print("Example: python quick_generate.py 'AI Director role...' 'Mayo Clinic' 'Director of AI Innovation'")
        return
    
    job_description = sys.argv[1]
    company_name = sys.argv[2]
    role_title = sys.argv[3]
    
    print(f"Generating resume for: {role_title} at {company_name}")
    print("="*60)
    
    # Generate resume
    generator = ResumeCardSystem()
    resume_data = generator.generate_tailored_resume(job_description, role_title)
    
    # Generate cover letter
    cover_gen = CoverLetterGenerator(resume_data)
    cover_letter = cover_gen.generate_cover_letter(company_name, role_title, job_description)
    
    # Create output directory
    safe_company = company_name.replace(" ", "_").replace("/", "_")
    safe_role = role_title.replace(" ", "_").replace("/", "_")
    output_dir = f"output/{safe_company}_{safe_role}"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate all formats
    formats = {
        "text": generate_formatted_resume(resume_data, "text"),
        "html": generate_formatted_resume(resume_data, "html"),
        "markdown": generate_formatted_resume(resume_data, "markdown")
    }
    
    # Save files
    for format_type, content in formats.items():
        ext = "txt" if format_type == "text" else format_type
        filename = f"{output_dir}/derek_simmons_resume.{ext}"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Saved: {filename}")
    
    # Save cover letter
    cover_filename = f"{output_dir}/derek_simmons_cover_letter.txt"
    with open(cover_filename, 'w', encoding='utf-8') as f:
        f.write(cover_letter)
    print(f"✅ Saved: {cover_filename}")
    
    # Print analysis
    print(f"\n📊 Analysis for {company_name} - {role_title}:")
    print(f"Industry Focus: {resume_data['metadata']['industry_focus']}")
    print(f"Key Scores: {resume_data['metadata']['adaptation_scores']}")
    
    print(f"\n📂 All files saved to: {output_dir}/")
    print("Ready for application submission! 🚀")

if __name__ == "__main__":
    main()
