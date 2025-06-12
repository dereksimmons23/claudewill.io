#!/usr/bin/env python3
"""
Resume Card Component Generator for Derek Simmons
Future-proof system using modular WHO methodology cards
"""

import json
import re
from datetime import datetime
from typing import Dict, List, Any

class ResumeCardSystem:
    def __init__(self, components_file: str = "resume-card-components.json"):
        with open(components_file, 'r') as f:
            self.components = json.load(f)
        
        self.contact_info = {
            "name": "DEREK SIMMONS",
            "location": "Minnesota/U.S.",
            "phone": "213-327-5683", 
            "email": "simmons.derek@gmail.com",
            "website": "claudewill.io",
            "portfolio": "claudewill.io/pages/portfolio.html",
            "linkedin": "linkedin.com/in/dereksimm"
        }
    
    def analyze_job_description(self, job_text: str) -> Dict[str, float]:
        """Analyze job description and return relevance scores for different card types"""
        job_lower = job_text.lower()
        
        scores = {
            "ai_focus": 0.0,
            "healthcare_focus": 0.0,
            "leadership_focus": 0.0, 
            "innovation_focus": 0.0,
            "consulting_focus": 0.0,
            "media_focus": 0.0,
            "technical_focus": 0.0,
            "strategy_focus": 0.0
        }
        
        # AI and Technology keywords
        ai_terms = ["artificial intelligence", "ai", "machine learning", "llm", "automation", "ethics", "responsible ai"]
        scores["ai_focus"] = sum(job_lower.count(term) for term in ai_terms) / len(ai_terms)
        
        # Healthcare keywords  
        healthcare_terms = ["healthcare", "medical", "patient", "clinical", "health", "mayo", "hospital"]
        scores["healthcare_focus"] = sum(job_lower.count(term) for term in healthcare_terms) / len(healthcare_terms)
        
        # Leadership keywords
        leadership_terms = ["director", "executive", "lead", "manage", "leadership", "strategy", "vision"]
        scores["leadership_focus"] = sum(job_lower.count(term) for term in leadership_terms) / len(leadership_terms)
        
        # Innovation keywords
        innovation_terms = ["innovation", "transform", "evangelist", "emerging", "disrupt", "breakthrough"]
        scores["innovation_focus"] = sum(job_lower.count(term) for term in innovation_terms) / len(innovation_terms)
        
        # Consulting keywords
        consulting_terms = ["consulting", "advisory", "strategic", "framework", "implementation"]
        scores["consulting_focus"] = sum(job_lower.count(term) for term in consulting_terms) / len(consulting_terms)
        
        # Media keywords
        media_terms = ["media", "content", "digital", "journalism", "publishing", "creative"]
        scores["media_focus"] = sum(job_lower.count(term) for term in media_terms) / len(media_terms)
        
        # Technical keywords
        technical_terms = ["technical", "software", "platform", "integration", "data", "analytics"]
        scores["technical_focus"] = sum(job_lower.count(term) for term in technical_terms) / len(technical_terms)
        
        # Strategy keywords
        strategy_terms = ["strategy", "strategic", "planning", "transformation", "growth", "revenue"]
        scores["strategy_focus"] = sum(job_lower.count(term) for term in strategy_terms) / len(strategy_terms)
        
        return scores
    
    def select_industry_adaptation(self, scores: Dict[str, float]) -> str:
        """Select the best industry adaptation based on job analysis scores"""
        if scores["healthcare_focus"] > 0.3:
            return "healthcare"
        elif scores["ai_focus"] > 0.5 or scores["technical_focus"] > 0.4:
            return "technology" 
        elif scores["consulting_focus"] > 0.3:
            return "consulting"
        elif scores["media_focus"] > 0.3:
            return "media"
        elif scores["innovation_focus"] > 0.4:
            return "technology"  # Innovation often maps to tech roles
        else:
            return "consulting"  # Default versatile positioning
    
    def generate_tailored_resume(self, job_description: str = "", role_title: str = "Strategic Role") -> Dict[str, Any]:
        """Generate a tailored resume based on job description analysis"""
        
        scores = self.analyze_job_description(job_description) if job_description else {}
        industry = self.select_industry_adaptation(scores)
        adaptation = self.components["industryAdaptations"][industry]
        
        # Select WHO cards based on industry adaptation
        selected_cards = []
        for card_key in adaptation["emphasize"]:
            if card_key in self.components["whoCards"]:
                card = self.components["whoCards"][card_key].copy()
                card["key"] = card_key
                selected_cards.append(card)
        
        # Generate summary based on selected focus
        summary = self._generate_summary(industry, scores)
        
        # Select metrics to highlight
        highlighted_metrics = self._select_metrics(adaptation["metrics"])
        
        # Generate experience section
        experience = self._generate_experience(selected_cards)
        
        # Generate skills section
        skills = self._generate_skills(adaptation["skills"])
        
        # Portfolio links
        portfolio = self._select_portfolio_links(scores)
        
        return {
            "metadata": {
                "generated": datetime.now().isoformat(),
                "industry_focus": industry,
                "role_title": role_title,
                "adaptation_scores": scores
            },
            "contact": self.contact_info,
            "summary": summary,
            "experience": experience,
            "skills": skills,
            "metrics": highlighted_metrics,
            "portfolio": portfolio,
            "education": self._get_education(),
            "additional": self._get_additional_sections(industry)
        }
    
    def _generate_summary(self, industry: str, scores: Dict[str, float]) -> str:
        """Generate tailored professional summary"""
        base = self.components["personalBrand"]["elevator"]
        
        if industry == "healthcare":
            return f"{base} Specialized in ethical AI implementation and systematic approaches to complex organizational challenges, with proven ability to navigate highly regulated environments while maintaining human-centered principles."
        elif industry == "technology": 
            return f"{base} Deep expertise in AI ethics, large language model implementation, and creating frameworks that ensure technology enhances rather than replaces human capability."
        elif industry == "consulting":
            return f"{base} Proven methodology for translating insights across domains to solve complex business challenges through systematic framework development and implementation."
        elif industry == "media":
            return f"{base} Pioneered innovative content strategies and digital transformation initiatives that generated significant revenue growth while maintaining editorial integrity."
        else:
            return base
    
    def _generate_experience(self, selected_cards: List[Dict]) -> List[Dict]:
        """Generate experience section using selected WHO cards"""
        experiences = []
        
        # Current role
        experiences.append({
            "title": "Founder & Chief Architect", 
            "company": "Claude Wisdom Strategies",
            "period": "Nov. 2024–Present",
            "description": "Research and development in AI implementation frameworks for enterprise applications",
            "bullets": [
                selected_cards[0]["what"] if selected_cards else "Developing conversational AI and strategy frameworks with focus on ethical, human-centered technology",
                selected_cards[0]["how"] if selected_cards else "Creating methodologies for knowledge management and productivity optimization",
                selected_cards[0]["outcome"] if selected_cards else "Building systems where technology serves as extension of human capability"
            ]
        })
        
        # Star Tribune Executive Director
        experiences.append({
            "title": "Executive Director, New Products",
            "company": "Star Tribune Media", 
            "period": "March 2022–Oct. 2024",
            "description": "Led AI strategy development and cross-departmental product innovation for 1,000+ employee organization",
            "bullets": [
                "Presented comprehensive AI strategic plan leading to AI Task Force development and enterprise-wide implementation strategy",
                "Generated $5M+ in incremental revenue streams through innovative content platforms and strategic partnerships", 
                "Designed and implemented SalesGPT solution with Krista.ai, reclaiming up to 2.5 work-years annually for sales team",
                "Directed cross-department product development ensuring cohesive, ethical implementation across all platforms"
            ]
        })
        
        # Add more experiences based on available cards
        if len(selected_cards) > 1:
            experiences.append({
                "title": "Chief Creative Officer / Vice President",
                "company": "Star Tribune Media",
                "period": "June 2017–March 2022", 
                "description": "Executive leadership driving digital transformation and revenue growth through innovation",
                "bullets": [
                    selected_cards[1]["what"] if len(selected_cards) > 1 else "Led design innovation driving digital subscription growth to 100,000+ (top 6 nationally)",
                    selected_cards[1]["how"] if len(selected_cards) > 1 else "Pioneered Media Franchise Model generating $15M+ in new revenue through innovative content structures",
                    selected_cards[1]["outcome"] if len(selected_cards) > 1 else "Built and led high-performing teams while maintaining operational excellence"
                ]
            })
        
        return experiences
    
    def _generate_skills(self, skill_categories: List[str]) -> Dict[str, List[str]]:
        """Generate skills section based on selected categories"""
        skills = {}
        for category in skill_categories:
            if category in self.components["skillClusters"]:
                # Convert camelCase to readable title
                title = re.sub(r'([A-Z])', r' \1', category).title().strip()
                skills[title] = self.components["skillClusters"][category]
        return skills
    
    def _select_metrics(self, metric_keys: List[str]) -> Dict[str, str]:
        """Select specific metrics to highlight"""
        highlighted = {}
        all_metrics = {**self.components["achievementMetrics"]["financial"], 
                      **self.components["achievementMetrics"]["leadership"],
                      **self.components["achievementMetrics"]["recognition"]}
        
        for key in metric_keys:
            if key in all_metrics:
                highlighted[key] = all_metrics[key]
        
        return highlighted
    
    def _select_portfolio_links(self, scores: Dict[str, float]) -> List[Dict]:
        """Select most relevant portfolio links based on role requirements"""
        all_links = self.components["portfolioLinks"]["published"] + self.components["portfolioLinks"]["current"]
        
        # Always include portfolio and key thought leadership
        selected = [
            link for link in all_links 
            if link["type"] in ["comprehensive-portfolio", "thought-leadership", "industry-profile"]
        ]
        
        # Add relevant creative work for certain roles
        if scores.get("media_focus", 0) > 0.2:
            selected.extend([link for link in all_links if link["type"] == "creative-writing"])
        
        return selected[:4]  # Limit to top 4 links
    
    def _get_education(self) -> List[Dict]:
        """Standard education section"""
        return [
            {
                "institution": "MIT Artificial Intelligence & Data Science Program",
                "credential": "Admitted, 2025 cohort",
                "details": ""
            },
            {
                "institution": "University of Southern California", 
                "credential": "Master of Communication Management",
                "details": "Admitted, 2022"
            },
            {
                "institution": "Kansas State University",
                "credential": "Bachelor of Science, Mass Communications", 
                "details": "Managing Editor & Head of Design, Kansas State Collegian"
            }
        ]
    
    def _get_additional_sections(self, industry: str) -> Dict[str, Any]:
        """Generate additional sections based on industry focus"""
        sections = {}
        
        if industry in ["technology", "consulting"]:
            sections["Technical Expertise"] = [
                "AI/LLMs: Claude, Gemini, ChatGPT, Perplexity",
                "Development Tools: Cursor, VS Code, Replit, GitHub", 
                "Collaboration: Slack, Notion, Obsidian",
                "Analytics: Tableau, Power BI"
            ]
        
        sections["Community Impact"] = [
            "Minnesota State University–Mankato: Customer Experience Advisory Board Member",
            "East Ridge Athletic Association: Basketball Board President (200+ families)",
            "Sports Coaching: 10+ years; 75% college scholarship success rate",
            "Volunteer Commitment: 75+ hours annually as keynote speaker and mentor"
        ]
        
        return sections

def generate_formatted_resume(resume_data: Dict[str, Any], format_type: str = "text") -> str:
    """Generate formatted resume in specified format"""
    
    if format_type == "text":
        return _generate_text_format(resume_data)
    elif format_type == "html":
        return _generate_html_format(resume_data)
    elif format_type == "markdown":
        return _generate_markdown_format(resume_data)
    else:
        return _generate_text_format(resume_data)

def _generate_text_format(data: Dict[str, Any]) -> str:
    """Generate ATS-optimized plain text resume"""
    lines = []
    
    # Header
    lines.append(data["contact"]["name"])
    lines.append(f"{data['contact']['location']} | {data['contact']['phone']} | {data['contact']['email']}")
    lines.append(f"{data['contact']['website']} | {data['contact']['linkedin']}")
    lines.append("")
    
    # Summary
    lines.append("PROFESSIONAL SUMMARY")
    lines.append("")
    lines.append(data["summary"])
    lines.append("")
    
    # Core Competencies (if metrics available)
    if data["metrics"]:
        lines.append("KEY ACHIEVEMENTS")
        lines.append("")
        for key, value in data["metrics"].items():
            formatted_key = key.replace("_", " ").title()
            lines.append(f"• {formatted_key}: {value}")
        lines.append("")
    
    # Experience
    lines.append("PROFESSIONAL EXPERIENCE")
    lines.append("")
    for exp in data["experience"]:
        lines.append(f"{exp['title']}")
        lines.append(f"{exp['company']} | {exp['period']}")
        lines.append(f"{exp['description']}")
        lines.append("")
        for bullet in exp["bullets"]:
            lines.append(f"• {bullet}")
        lines.append("")
    
    # Skills
    if data["skills"]:
        lines.append("CORE COMPETENCIES")
        lines.append("")
        for category, skills in data["skills"].items():
            lines.append(f"{category}:")
            for skill in skills:
                lines.append(f"• {skill}")
            lines.append("")
    
    # Education
    lines.append("EDUCATION & PROFESSIONAL DEVELOPMENT")
    lines.append("")
    for edu in data["education"]:
        lines.append(f"{edu['institution']}")
        lines.append(f"{edu['credential']}")
        if edu["details"]:
            lines.append(f"• {edu['details']}")
        lines.append("")
    
    # Additional sections
    for section_name, content in data["additional"].items():
        lines.append(section_name.upper())
        lines.append("")
        for item in content:
            lines.append(f"• {item}")
        lines.append("")
    
    # Portfolio
    if data["portfolio"]:
        lines.append("PORTFOLIO & PUBLISHED WORK")
        lines.append("")
        for link in data["portfolio"]:
            lines.append(f"• {link['title']}: {link['url']}")
        lines.append("")
    
    return "\n".join(lines)

def _generate_html_format(data: Dict[str, Any]) -> str:
    """Generate HTML format for PDF conversion"""
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{data['contact']['name']} - Resume</title>
    <style>
        body {{ font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.3; margin: 0.5in; color: #000; }}
        .header {{ text-align: center; margin-bottom: 0.8rem; border-bottom: 2px solid #2c3e50; padding-bottom: 0.4rem; }}
        .name {{ font-size: 1.6rem; font-weight: bold; color: #2c3e50; margin-bottom: 0.3rem; }}
        .contact {{ font-size: 0.95rem; color: #666; line-height: 1.4; }}
        .section {{ margin-bottom: 0.8rem; }}
        .section-title {{ font-size: 1rem; font-weight: bold; color: #2c3e50; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; border-bottom: 1px solid #bdc3c7; padding-bottom: 0.2rem; }}
        .summary {{ font-size: 0.95rem; line-height: 1.4; text-align: justify; margin-bottom: 0.8rem; color: #444; }}
        .job {{ margin-bottom: 1rem; }}
        .job-header {{ display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.3rem; }}
        .job-title {{ font-weight: bold; font-size: 1rem; color: #2c3e50; }}
        .job-company {{ font-weight: bold; color: #34495e; margin-left: 0.5rem; }}
        .job-dates {{ font-style: italic; color: #666; font-size: 0.9rem; }}
        .job-description {{ font-style: italic; color: #555; margin-bottom: 0.5rem; font-size: 0.95rem; }}
        .achievements {{ list-style: none; margin-left: 0; }}
        .achievements li {{ margin-bottom: 0.2rem; padding-left: 1rem; position: relative; font-size: 0.9rem; line-height: 1.3; }}
        .achievements li:before {{ content: "▪"; color: #3498db; position: absolute; left: 0; font-weight: bold; }}
        .two-column {{ display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }}
        .metrics {{ display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }}
        .metric {{ background: #f8f9fa; padding: 0.5rem; border-radius: 4px; }}
        @media print {{ body {{ padding: 0.3in; font-size: 10pt; }} }}
    </style>
</head>
<body>
    <div class="header">
        <div class="name">{data['contact']['name']}</div>
        <div class="contact">
            {data['contact']['location']} | {data['contact']['phone']} | {data['contact']['email']}<br>
            {data['contact']['website']} | {data['contact']['linkedin']}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="summary">{data['summary']}</div>
    </div>"""
    
    # Metrics section
    if data["metrics"]:
        html += """
    <div class="section">
        <div class="section-title">Key Achievements</div>
        <div class="metrics">"""
        for key, value in data["metrics"].items():
            formatted_key = key.replace("_", " ").title()
            html += f'<div class="metric"><strong>{value}</strong><br>{formatted_key}</div>'
        html += """
        </div>
    </div>"""
    
    # Experience section
    html += """
    <div class="section">
        <div class="section-title">Professional Experience</div>"""
    
    for exp in data["experience"]:
        html += f"""
        <div class="job">
            <div class="job-header">
                <div>
                    <span class="job-title">{exp['title']}</span>
                    <span class="job-company">| {exp['company']}</span>
                </div>
                <div class="job-dates">{exp['period']}</div>
            </div>
            <div class="job-description">{exp['description']}</div>
            <ul class="achievements">"""
        for bullet in exp["bullets"]:
            html += f"<li>{bullet}</li>"
        html += """
            </ul>
        </div>"""
    
    html += """
    </div>"""
    
    # Skills section
    if data["skills"]:
        html += """
    <div class="section">
        <div class="section-title">Core Competencies</div>
        <div class="two-column">"""
        for category, skills in data["skills"].items():
            html += f"""
            <div>
                <h4 style="margin-bottom: 0.5rem; color: #2c3e50;">{category}</h4>
                <ul class="achievements">"""
            for skill in skills:
                html += f"<li>{skill}</li>"
            html += """
                </ul>
            </div>"""
        html += """
        </div>
    </div>"""
    
    # Education section
    html += """
    <div class="section">
        <div class="section-title">Education & Professional Development</div>"""
    for edu in data["education"]:
        html += f"""
        <div style="margin-bottom: 0.5rem;">
            <strong>{edu['institution']}</strong><br>
            {edu['credential']}"""
        if edu["details"]:
            html += f"<br>• {edu['details']}"
        html += """
        </div>"""
    html += """
    </div>"""
    
    # Additional sections
    for section_name, content in data["additional"].items():
        html += f"""
    <div class="section">
        <div class="section-title">{section_name}</div>
        <ul class="achievements">"""
        for item in content:
            html += f"<li>{item}</li>"
        html += """
        </ul>
    </div>"""
    
    html += """
</body>
</html>"""
    return html

def _generate_markdown_format(data: Dict[str, Any]) -> str:
    """Generate Markdown format"""
    lines = []
    
    # Header
    lines.append(f"# {data['contact']['name']}")
    lines.append(f"{data['contact']['location']} | {data['contact']['phone']} | {data['contact']['email']}")
    lines.append(f"{data['contact']['website']} | {data['contact']['linkedin']}")
    lines.append("")
    
    # Summary
    lines.append("## Professional Summary")
    lines.append("")
    lines.append(data["summary"])
    lines.append("")
    
    # Metrics
    if data["metrics"]:
        lines.append("## Key Achievements")
        lines.append("")
        for key, value in data["metrics"].items():
            formatted_key = key.replace("_", " ").title()
            lines.append(f"- **{formatted_key}:** {value}")
        lines.append("")
    
    # Experience
    lines.append("## Professional Experience")
    lines.append("")
    for exp in data["experience"]:
        lines.append(f"### {exp['title']}")
        lines.append(f"**{exp['company']}** | {exp['period']}")
        lines.append("")
        lines.append(f"*{exp['description']}*")
        lines.append("")
        for bullet in exp["bullets"]:
            lines.append(f"- {bullet}")
        lines.append("")
    
    # Skills
    if data["skills"]:
        lines.append("## Core Competencies")
        lines.append("")
        for category, skills in data["skills"].items():
            lines.append(f"### {category}")
            for skill in skills:
                lines.append(f"- {skill}")
            lines.append("")
    
    return "\n".join(lines)

# Cover Letter Generator
class CoverLetterGenerator:
    def __init__(self, resume_data: Dict[str, Any]):
        self.resume_data = resume_data
    
    def generate_cover_letter(self, company: str, role: str, job_description: str = "") -> str:
        """Generate tailored cover letter"""
        
        # Analyze role focus
        scores = ResumeCardSystem().analyze_job_description(job_description)
        industry = self.resume_data["metadata"]["industry_focus"]
        
        # Select key accomplishments based on industry
        key_accomplishments = self._select_accomplishments(industry, scores)
        
        # Generate opening
        opening = self._generate_opening(company, role)
        
        # Generate body paragraphs
        body = self._generate_body(company, role, key_accomplishments, industry)
        
        # Generate closing
        closing = self._generate_closing(company, role)
        
        return f"""{opening}

{body}

{closing}

Sincerely,
Derek Simmons
213-327-5683
simmons.derek@gmail.com"""
    
    def _select_accomplishments(self, industry: str, scores: Dict[str, float]) -> List[str]:
        """Select most relevant accomplishments"""
        if industry == "healthcare":
            return [
                "Led AI Task Force development for 1,000+ employee organization with focus on ethical implementation",
                "Generated $5M+ in revenue through systematic approach to innovation and strategic partnerships",
                "Built frameworks ensuring technology enhances rather than replaces human judgment"
            ]
        elif industry == "technology":
            return [
                "Developed comprehensive AI strategic plan leading to enterprise-wide Task Force implementation",
                "Created SalesGPT solution with Krista.ai, reclaiming 2.5 work-years annually through automation",
                "Founded Claude Wisdom Strategies focusing on ethical AI implementation and human-centered technology"
            ]
        else:
            return [
                "Generated $20M+ in revenue through cross-domain pattern recognition and strategic innovation",
                "Led digital transformation initiatives resulting in top 6 national ranking for digital subscriptions",
                "Developed The CW Standard framework for systematic approaches to complex organizational challenges"
            ]
    
    def _generate_opening(self, company: str, role: str) -> str:
        """Generate opening paragraph"""
        return f"""Dear {company} Hiring Team,

The {role} position represents the perfect intersection of my AI strategy expertise and proven revenue generation track record. Having led enterprise-wide AI implementation strategy and generated $20M+ in new revenue streams, I am excited to bring this unique combination of technical leadership and business development success to {company}. Your focus on transforming operations while maintaining human-centered principles aligns directly with my experience driving efficiency through innovative technology solutions."""
    
    def _generate_body(self, company: str, role: str, accomplishments: List[str], industry: str) -> str:
        """Generate body paragraphs"""
        
        para1 = f"""In my recent role as Executive Director at Star Tribune Media, {accomplishments[0]}. This experience mirrors the scope of transformation {company} requires. Additionally, {accomplishments[1]}—exactly the kind of strategic thinking needed to drive innovation and build relationships with stakeholders. My ability to translate complex technical concepts for both technical and non-technical audiences has been essential in leading cross-functional teams and driving adoption of innovative solutions."""
        
        para2 = f"""Your requirement for someone who can act as both strategic leader and hands-on implementer resonates strongly with my career trajectory. {accomplishments[2]}. My upcoming participation in MIT's AI & Data Science Program further demonstrates my commitment to staying at the forefront of technological innovation. I would welcome the opportunity to discuss how my combination of strategic expertise, revenue generation success, and leadership experience can contribute to {company}'s transformation initiatives."""
        
        return f"{para1}\n\n{para2}"
    
    def _generate_closing(self, company: str, role: str) -> str:
        """Generate closing paragraph"""
        return f"""I am excited about the opportunity to bring my unique perspective on ethical AI implementation and cross-domain pattern recognition to {company}. Thank you for considering my application. I look forward to discussing how my experience in building frameworks that bridge human wisdom with technological advancement can drive meaningful results for your organization."""

if __name__ == "__main__":
    # Example usage
    generator = ResumeCardSystem()
    
    # Sample job description for testing
    sample_job = """
    We are seeking a Director of AI Innovation to lead our healthcare transformation initiatives.
    The ideal candidate will have experience with artificial intelligence implementation,
    strategic leadership, and working in regulated environments. Must have proven track record
    of revenue generation and team leadership. Experience with ethical AI frameworks preferred.
    """
    
    # Generate resume
    resume = generator.generate_tailored_resume(sample_job, "Director of AI Innovation")
    
    # Generate different formats
    text_resume = generate_formatted_resume(resume, "text")
    html_resume = generate_formatted_resume(resume, "html")
    markdown_resume = generate_formatted_resume(resume, "markdown")
    
    # Generate cover letter
    cover_letter_gen = CoverLetterGenerator(resume)
    cover_letter = cover_letter_gen.generate_cover_letter("Healthcare Innovation Corp", "Director of AI Innovation", sample_job)
    
    print("Text Resume:")
    print(text_resume)
    print("\n" + "="*50 + "\n")
    print("Cover Letter:")
    print(cover_letter)
