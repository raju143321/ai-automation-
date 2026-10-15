import { ResearchProject, Source, ResearchAnalysis, CitationStyle } from '../shared/index.js';
import { db } from '../lib/db.js';

export interface ExportOptions {
  projectId: string;
  analysisId?: string;
  format: 'markdown' | 'json' | 'csv' | 'txt' | 'pdf' | 'docx';
  citationStyle: CitationStyle;
  includeMetadata: boolean;
  includeCitations: boolean;
}

export class ExportService {
  public generateExport(options: ExportOptions): { content: string; contentType: string; filename: string } {
    const project = db.getProject(options.projectId);
    if (!project) throw new Error('Project not found');

    const sources = db.getSources(options.projectId);
    const analyses = db.getAnalyses(options.projectId);
    const claims = db.getClaims(options.projectId);
    const selectedAnalysis = options.analysisId ? analyses.find(a => a.id === options.analysisId) : analyses[0];

    const safeTitle = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    const timestamp = new Date().toISOString().split('T')[0];

    switch (options.format) {
      case 'markdown':
        return {
          content: this.generateMarkdown(project, sources, selectedAnalysis, claims, options.citationStyle),
          contentType: 'text/markdown; charset=utf-8',
          filename: `research-brief-${safeTitle}-${timestamp}.md`
        };

      case 'json':
        return {
          content: JSON.stringify({
            project,
            analysis: selectedAnalysis,
            claims,
            sources: sources.map(s => ({
              title: s.title,
              authors: s.authors,
              doi: s.doi,
              url: s.canonical_url,
              publisher: s.publisher,
              date: s.publication_date
            })),
            exported_at: new Date().toISOString()
          }, null, 2),
          contentType: 'application/json; charset=utf-8',
          filename: `research-data-${safeTitle}-${timestamp}.json`
        };

      case 'csv':
        return {
          content: this.generateCSV(claims, sources),
          contentType: 'text/csv; charset=utf-8',
          filename: `claims-evidence-${safeTitle}-${timestamp}.csv`
        };

      case 'txt':
        return {
          content: this.generateText(project, sources, selectedAnalysis),
          contentType: 'text/plain; charset=utf-8',
          filename: `research-brief-${safeTitle}-${timestamp}.txt`
        };

      case 'pdf':
      case 'docx':
      default:
        // Returns clean HTML document that browsers render / save directly to PDF
        return {
          content: this.generateHtmlReport(project, sources, selectedAnalysis, claims, options.citationStyle),
          contentType: 'text/html; charset=utf-8',
          filename: `research-report-${safeTitle}-${timestamp}.html`
        };
    }
  }

  private generateMarkdown(
    project: ResearchProject,
    sources: Source[],
    analysis?: ResearchAnalysis,
    claims: any[] = [],
    style: CitationStyle = 'APA'
  ): string {
    const lines: string[] = [];
    lines.push(`# ${project.title}`);
    lines.push(`\n**Research Question:** ${project.research_question}`);
    if (project.description) lines.push(`\n**Description:** ${project.description}`);
    lines.push(`\n**Domain:** ${project.domain} | **Citation Style:** ${style} | **Generated:** ${new Date().toLocaleDateString()}`);

    if (analysis) {
      lines.push(`\n---\n\n## ${analysis.title}`);
      lines.push(`\n### Executive Synthesis`);
      const result = analysis.result as any;
      if (result.executive_summary) lines.push(result.executive_summary);
      if (result.introduction) lines.push(result.introduction);

      if (result.key_findings && Array.isArray(result.key_findings)) {
        lines.push(`\n### Key Findings`);
        for (const f of result.key_findings) {
          lines.push(`- **${f.finding}**`);
          if (f.interpretation) lines.push(`  *Interpretation:* ${f.interpretation}`);
        }
      }

      if (result.themes && Array.isArray(result.themes)) {
        lines.push(`\n### Literature Review Themes`);
        for (const t of result.themes) {
          lines.push(`#### ${t.name}\n${t.synthesis}\n`);
        }
      }

      if (result.research_gaps && Array.isArray(result.research_gaps)) {
        lines.push(`\n### Identified Research Gaps`);
        for (const g of result.research_gaps) {
          lines.push(`- **${g.gap || g.title}**: ${g.justification || g.description}`);
        }
      }
    }

    if (claims.length > 0) {
      lines.push(`\n---\n\n## Verified Claims & Evidence Assessment`);
      for (const c of claims) {
        lines.push(`- **[${c.assessment.toUpperCase()}]** ${c.claim_text}`);
        if (c.rationale) lines.push(`  *Rationale:* ${c.rationale}`);
      }
    }

    lines.push(`\n---\n\n## References (${style})`);
    sources.forEach((s, idx) => {
      lines.push(this.formatCitation(s, idx + 1, style));
    });

    return lines.join('\n');
  }

  private generateText(project: ResearchProject, sources: Source[], analysis?: ResearchAnalysis): string {
    return this.generateMarkdown(project, sources, analysis, [], 'APA')
      .replace(/#/g, '')
      .replace(/\*\*/g, '');
  }

  private generateCSV(claims: any[], sources: Source[]): string {
    const sanitize = (val: string) => {
      // Defend against CSV injection (values starting with =, +, -, @)
      let str = (val || '').replace(/"/g, '""');
      if (/^[=+\-@]/.test(str)) str = `'${str}`;
      return `"${str}"`;
    };

    const header = ['Claim ID', 'Claim Type', 'Assessment', 'Confidence', 'Claim Text', 'Rationale'];
    const rows = claims.map(c => [
      sanitize(c.id),
      sanitize(c.claim_type),
      sanitize(c.assessment),
      sanitize(String(c.confidence ?? '')),
      sanitize(c.claim_text),
      sanitize(c.rationale ?? '')
    ].join(','));

    return [header.join(','), ...rows].join('\n');
  }

  private generateHtmlReport(
    project: ResearchProject,
    sources: Source[],
    analysis?: ResearchAnalysis,
    claims: any[] = [],
    style: CitationStyle = 'APA'
  ): string {
    const result = (analysis?.result || {}) as any;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project.title} — ResearchSphere AI Report</title>
  <style>
    body { font-family: 'Times New Roman', Georgia, serif; line-height: 1.6; max-width: 800px; margin: 40px auto; color: #111; padding: 0 20px; }
    h1 { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 26px; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 12px; }
    h2 { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 19px; color: #222; margin-top: 28px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    h3 { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; margin-top: 16px; }
    .meta { font-size: 13px; color: #666; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e2e8f0; }
    .supported { background: #d1fae5; color: #065f46; }
    .references { font-size: 13px; padding-left: 20px; }
    .references li { margin-bottom: 8px; }
    @media print {
      body { margin: 20mm; font-size: 12pt; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 12px; border-radius: 6px; margin-bottom: 24px; font-family: sans-serif; font-size: 13px;">
    <strong>Print / Save as PDF:</strong> Press <code>Ctrl + P</code> (or <code>Cmd + P</code> on Mac) and select "Save as PDF".
  </div>
  <h1>${project.title}</h1>
  <div class="meta">
    <strong>Research Question:</strong> ${project.research_question}<br>
    <strong>Domain:</strong> ${project.domain} | <strong>Date:</strong> ${new Date().toLocaleDateString()} | <strong>Citation Style:</strong> ${style}
  </div>

  ${result.executive_summary ? `<h2>Executive Summary</h2><p>${result.executive_summary}</p>` : ''}
  ${result.introduction ? `<h2>Introduction</h2><p>${result.introduction}</p>` : ''}

  ${result.key_findings ? `
    <h2>Key Findings</h2>
    <ul>
      ${result.key_findings.map((f: any) => `<li><strong>${f.finding}</strong><br><em>${f.interpretation || ''}</em></li>`).join('')}
    </ul>
  ` : ''}

  ${claims.length > 0 ? `
    <h2>Claims & Evidence Assessment</h2>
    <ul>
      ${claims.map(c => `<li><span class="badge ${c.assessment}">${c.assessment.toUpperCase()}</span> ${c.claim_text}<br><small>${c.rationale || ''}</small></li>`).join('')}
    </ul>
  ` : ''}

  <h2>References (${style})</h2>
  <ol class="references">
    ${sources.map((s, idx) => `<li>${this.formatCitation(s, idx + 1, style)}</li>`).join('')}
  </ol>
</body>
</html>`;
  }

  private formatCitation(source: Source, index: number, style: CitationStyle): string {
    const authors = source.authors && source.authors.length > 0
      ? source.authors.map((a: any) => a.name).join(', ')
      : 'Author Unknown';
    const year = source.publication_date ? source.publication_date.split('-')[0] : 'n.d.';
    const title = source.title;
    const publisher = source.publisher || 'ResearchSphere Repository';
    const doiStr = source.doi ? `https://doi.org/${source.doi}` : (source.canonical_url || '');

    switch (style) {
      case 'MLA':
        return `${authors}. "${title}." *${publisher}*, ${year}, ${doiStr}.`;
      case 'Chicago':
        return `${authors}. "${title}." *${publisher}* (${year}). ${doiStr}.`;
      case 'IEEE':
        return `[${index}] ${authors}, "${title}," in *${publisher}*, ${year}. [Online]. Available: ${doiStr}`;
      case 'Vancouver':
        return `${index}. ${authors}. ${title}. ${publisher}; ${year}. Available from: ${doiStr}`;
      case 'APA':
      default:
        return `${authors} (${year}). *${title}*. ${publisher}. ${doiStr}`;
    }
  }
}

export const exportService = new ExportService();
