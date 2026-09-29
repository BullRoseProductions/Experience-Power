import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import {
  Loader2, Sparkles, Copy, Check, AlertCircle, ArrowLeft,
  ClipboardCheck, Search, FileText, LayoutGrid, CalendarClock, SlidersHorizontal,
  ChevronRight, RefreshCw, Lightbulb, Building2,
  Download, FileDown, Clock, Trash2, History, Printer
} from 'lucide-react';

const STORAGE_KEY = 'experience-power-studio-state-v1';
const HISTORY_LIMIT = 10;

// ─────────── PALETTE (Experience POWER Industrial) ───────────
const C = {
  // Dark surfaces
  base: '#0A0E14',
  baseElevated: '#12171F',
  basePanel: '#1A2029',
  baseHover: '#212934',

  // Glass panels
  glass: 'rgba(26, 32, 41, 0.75)',
  glassStrong: 'rgba(26, 32, 41, 0.92)',
  glassHover: 'rgba(33, 41, 52, 0.96)',

  // Text (warm off-whites)
  text: '#F0EEE9',
  textSoft: '#C8C5BE',
  textMuted: '#8B8880',
  textFaded: '#5A5850',
  // Backwards-compat aliases for legacy usage
  ink: '#F0EEE9',
  inkSoft: '#C8C5BE',
  inkMuted: '#8B8880',
  inkFaded: '#5A5850',

  // Experience POWER accents
  red: '#E41824',
  redBright: '#FF2937',
  redDeep: '#A31219',
  redSoft: 'rgba(228, 24, 36, 0.15)',
  redPale: 'rgba(228, 24, 36, 0.08)',

  teal: '#3CA8B4',
  tealBright: '#4FC0CC',
  tealDeep: '#1F7A85',
  tealSoft: 'rgba(60, 168, 180, 0.15)',

  green: '#48B490',
  greenBright: '#5CCFA5',
  greenDeep: '#2A7A5F',

  // Backwards-compat aliases for CSEF blue references (mapped to teal)
  blue: '#3CA8B4',
  blueDark: '#1F7A85',
  blueDeep: '#0F4A52',
  blueBright: '#4FC0CC',
  blueSky: '#87DAE0',
  blueSkySoft: 'rgba(60, 168, 180, 0.12)',

  // Brass aliases → mapped to red (the warm accent)
  brass: '#E41824',
  brassLight: '#FF6B75',
  brassPale: 'rgba(228, 24, 36, 0.08)',

  // Rules
  rule: 'rgba(255, 255, 255, 0.06)',
  ruleStrong: 'rgba(255, 255, 255, 0.12)',
  ruleRed: 'rgba(228, 24, 36, 0.3)',
  ruleTeal: 'rgba(60, 168, 180, 0.3)',
  ruleBlue: 'rgba(60, 168, 180, 0.25)',

  success: '#5CCFA5',
  white: '#FFFFFF',
  paper: '#12171F',
  paperWarm: '#1A2029',
  paperAlt: '#212934',
  panel: '#1A2029',

  // Gradients — teal→green (the power button glow) and red for CTAs
  gradPower: 'linear-gradient(135deg, #4FC0CC 0%, #3CA8B4 40%, #48B490 100%)',
  gradPowerHover: 'linear-gradient(135deg, #5CCFA5 0%, #4FC0CC 50%, #3CA8B4 100%)',
  gradRed: 'linear-gradient(135deg, #FF2937 0%, #E41824 50%, #A31219 100%)',
  gradRedHover: 'linear-gradient(135deg, #FF4B5A 0%, #FF2937 50%, #E41824 100%)',
  gradIcon: 'linear-gradient(145deg, #4FC0CC 0%, #3CA8B4 40%, #1F7A85 100%)',
  gradIconInset: 'linear-gradient(145deg, rgba(255,255,255,0.20) 0%, transparent 40%)',
  gradPanel: 'linear-gradient(180deg, rgba(33, 41, 52, 0.9) 0%, rgba(26, 32, 41, 0.85) 100%)',
  gradHeader: 'linear-gradient(180deg, rgba(18, 23, 31, 0.95) 0%, rgba(10, 14, 20, 0.9) 100%)',
  gradBlue: 'linear-gradient(135deg, #4FC0CC 0%, #3CA8B4 50%, #1F7A85 100%)',
  gradBlueHover: 'linear-gradient(135deg, #5CCFA5 0%, #4FC0CC 50%, #3CA8B4 100%)',

  // Shadows — deeper for dark mode
  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 1px rgba(0, 0, 0, 0.2)',
  shadowMd: `
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 3px 6px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.04)
  `,
  shadowLg: `
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 10px 20px rgba(0, 0, 0, 0.35),
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05)
  `,
  shadowXl: `
    0 30px 60px rgba(0, 0, 0, 0.6),
    0 16px 32px rgba(0, 0, 0, 0.4),
    0 6px 12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.06)
  `,
  // Illuminated teal icon glow
  shadowIcon: `
    0 6px 16px rgba(60, 168, 180, 0.4),
    0 2px 6px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    inset 0 -1px 0 rgba(0, 0, 0, 0.4)
  `,
  shadowIconHover: `
    0 10px 28px rgba(60, 168, 180, 0.6),
    0 4px 10px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.45)
  `,
  // Red button — the "power on" CTA
  shadowButton: `
    0 8px 20px rgba(228, 24, 36, 0.35),
    0 3px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    inset 0 -2px 0 rgba(163, 18, 25, 0.4)
  `,
  shadowButtonHover: `
    0 12px 32px rgba(228, 24, 36, 0.5),
    0 5px 12px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -2px 0 rgba(163, 18, 25, 0.45)
  `,
};


// ─────────── MARKDOWN RENDERING ───────────

function markdownToPlainText(md) {
  if (!md) return '';
  return md
    .replace(/═+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/^[\s]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function InlineBold({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ fontWeight: 600, color: C.ink }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MarkdownOutput({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks = [];
  let currentList = null;
  let currentQuote = null;

  const flushList = () => {
    if (currentList) {
      blocks.push({ type: currentList.type, items: currentList.items });
      currentList = null;
    }
  };
  const flushQuote = () => {
    if (currentQuote) {
      blocks.push({ type: 'quote', lines: currentQuote });
      currentQuote = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // ═══ SECTION HEADER ═══ (legacy support)
    if (/^═+/.test(trimmed) && /═+$/.test(trimmed)) {
      flushList(); flushQuote();
      const label = trimmed.replace(/═+/g, '').trim();
      if (label) blocks.push({ type: 'section', text: label });
      continue;
    }

    // ## Headings
    const headingMatch = /^(#{1,4})\s+(.+)/.exec(trimmed);
    if (headingMatch) {
      flushList(); flushQuote();
      const level = headingMatch[1].length;
      const cleanText = headingMatch[2]
        .replace(/^═+\s*/, '').replace(/\s*═+$/, '')
        .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+\s*/u, '')
        .trim();
      if (level <= 2) {
        blocks.push({ type: 'section', text: cleanText });
      } else {
        blocks.push({ type: 'heading', level, text: cleanText });
      }
      continue;
    }

    // Bare ALL CAPS line = section header
    if (
      trimmed.length > 0 &&
      trimmed.length < 90 &&
      /^[A-Z][A-Z0-9\s\-—/&(),':.]+$/.test(trimmed) &&
      /[A-Z]{3}/.test(trimmed) &&
      !trimmed.endsWith(':') &&
      !trimmed.endsWith('.')
    ) {
      flushList(); flushQuote();
      blocks.push({ type: 'section', text: trimmed });
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      flushList();
      if (!currentQuote) currentQuote = [];
      currentQuote.push(trimmed.replace(/^>\s?/, ''));
      continue;
    }
    flushQuote();

    if (/^[-•]\s+/.test(trimmed)) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(trimmed.replace(/^[-•]\s+/, ''));
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(trimmed.replace(/^\d+\.\s+/, ''));
      continue;
    }
    flushList();

    if (trimmed === '') {
      blocks.push({ type: 'break' });
      continue;
    }

    blocks.push({ type: 'paragraph', text: trimmed });
  }
  flushList(); flushQuote();

  return (
    <div>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'section':
            return (
              <div key={i} className="print-section-marker" style={{
                marginTop: i === 0 ? 0 : 32, marginBottom: 16,
                paddingTop: 20, paddingBottom: 8,
              }}>
                <div style={{
                  height: 1,
                  background: `linear-gradient(90deg, ${C.blueDeep} 0%, ${C.blue} 40%, ${C.rule} 100%)`,
                  marginBottom: 12,
                }} />
                <div className="mono print-section-marker-label" style={{
                  fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
                  color: C.brass, fontWeight: 700, marginBottom: 2,
                }}>Section</div>
                <div className="display-heavy print-section-marker-title" style={{
                  fontSize: 18, color: C.blueDeep, letterSpacing: '-0.015em',
                }}>{block.text}</div>
              </div>
            );
          case 'heading':
            return (
              <div key={i} className="display" style={{
                fontSize: block.level === 1 ? 22 : block.level === 2 ? 19 : 17,
                color: C.ink, marginTop: 20, marginBottom: 10, lineHeight: 1.25, fontWeight: 500,
              }}>
                <InlineBold text={block.text} />
              </div>
            );
          case 'paragraph':
            return (
              <p key={i} style={{ margin: '0 0 14px', lineHeight: 1.7, color: C.inkSoft, fontSize: 15 }}>
                <InlineBold text={block.text} />
              </p>
            );
          case 'ul':
            return (
              <ul key={i} style={{ margin: '0 0 16px', paddingLeft: 22, lineHeight: 1.6 }}>
                {block.items.map((it, j) => (
                  <li key={j} style={{ marginBottom: 6, color: C.inkSoft, fontSize: 15 }}>
                    <InlineBold text={it} />
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} style={{ margin: '0 0 16px', paddingLeft: 22, lineHeight: 1.6 }}>
                {block.items.map((it, j) => (
                  <li key={j} style={{ marginBottom: 6, color: C.inkSoft, fontSize: 15 }}>
                    <InlineBold text={it} />
                  </li>
                ))}
              </ol>
            );
          case 'quote':
            return (
              <blockquote key={i} style={{
                margin: '12px 0 16px', padding: '10px 16px',
                borderLeft: `3px solid ${C.blue}`, background: C.blueSkySoft,
                fontStyle: 'italic', color: C.inkSoft, lineHeight: 1.6,
              }}>
                {block.lines.map((l, j) => (
                  <div key={j} style={{ marginBottom: j < block.lines.length - 1 ? 6 : 0 }}>
                    <InlineBold text={l} />
                  </div>
                ))}
              </blockquote>
            );
          case 'break':
            return <div key={i} style={{ height: 8 }} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

// ─────────── DOWNLOADS ───────────

function sanitizeFilename(str) {
  return (str || 'output')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'output';
}

function buildFilename(modeTitle, inputs, ext) {
  const dateStr = new Date().toISOString().slice(0, 10);
  // Try to find a meaningful input to use in the filename
  const identifier = inputs?.guestName || inputs?.episodeTitle || inputs?.topic || '';
  const parts = [
    'csef',
    sanitizeFilename(modeTitle),
    identifier ? sanitizeFilename(identifier) : null,
    dateStr,
  ].filter(Boolean);
  return `${parts.join('-')}.${ext}`;
}

function downloadTextFile(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function downloadPDF(text, filename, modeTitle, modeTagline) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 54;
  const marginTop = 54;
  const marginBottom = 54;
  const contentWidth = pageWidth - (marginX * 2);
  let y = marginTop;

  // ── Header: CSEF eyebrow ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(184, 147, 92); // brass
  doc.text('CSEF CONTENT STUDIO', marginX, y);
  y += 22;

  // ── Title ──
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(10, 25, 41);
  const titleLines = doc.splitTextToSize(modeTitle, contentWidth);
  doc.text(titleLines, marginX, y);
  y += titleLines.length * 24 + 4;

  // ── Tagline ──
  if (modeTagline) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 100, 120);
    doc.text(modeTagline, marginX, y);
    y += 14;
  }

  // ── Date ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(152, 160, 175);
  const dateLine = 'Generated ' + new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  doc.text(dateLine, marginX, y);
  y += 20;

  // ── Divider ──
  doc.setDrawColor(0, 105, 180);
  doc.setLineWidth(1.5);
  doc.line(marginX, y, marginX + 60, y);
  y += 22;

  // ── Body: parse blocks and render ──
  const blocks = parseMarkdown(text);
  const addPageIfNeeded = (needed = 20) => {
    if (y + needed > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  };

  const stripBold = (s) => (s || '').replace(/\*\*(.+?)\*\*/g, '$1');

  for (const block of blocks) {
    if (block.type === 'section') {
      addPageIfNeeded(50);
      y += 8;
      doc.setDrawColor(0, 43, 78);
      doc.setLineWidth(0.75);
      doc.line(marginX, y, marginX + contentWidth, y);
      y += 14;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(184, 147, 92);
      doc.text('SECTION', marginX, y);
      y += 12;
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 43, 78);
      const secLines = doc.splitTextToSize(block.text, contentWidth);
      doc.text(secLines, marginX, y);
      y += secLines.length * 16 + 8;
    } else if (block.type === 'heading') {
      addPageIfNeeded(30);
      y += 6;
      const size = block.level === 1 ? 15 : block.level === 2 ? 13 : 12;
      doc.setFont('times', 'bold');
      doc.setFontSize(size);
      doc.setTextColor(10, 25, 41);
      const hLines = doc.splitTextToSize(stripBold(block.text), contentWidth);
      doc.text(hLines, marginX, y);
      y += hLines.length * (size + 2) + 6;
    } else if (block.type === 'paragraph') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(31, 44, 62);
      const pLines = doc.splitTextToSize(stripBold(block.text), contentWidth);
      for (const line of pLines) {
        addPageIfNeeded(16);
        doc.text(line, marginX, y);
        y += 14;
      }
      y += 6;
    } else if (block.type === 'ul' || block.type === 'ol') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(31, 44, 62);
      const indent = 18;
      block.items.forEach((item, idx) => {
        const marker = block.type === 'ol' ? `${idx + 1}.` : '•';
        const itemLines = doc.splitTextToSize(stripBold(item), contentWidth - indent);
        for (let i = 0; i < itemLines.length; i++) {
          addPageIfNeeded(16);
          if (i === 0) {
            doc.setFont('helvetica', 'bold');
            doc.text(marker, marginX, y);
            doc.setFont('helvetica', 'normal');
          }
          doc.text(itemLines[i], marginX + indent, y);
          y += 14;
        }
        y += 2;
      });
      y += 4;
    } else if (block.type === 'quote') {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10.5);
      doc.setTextColor(31, 44, 62);
      block.lines.forEach(line => {
        const qLines = doc.splitTextToSize(stripBold(line), contentWidth - 12);
        for (const l of qLines) {
          addPageIfNeeded(16);
          doc.setDrawColor(0, 105, 180);
          doc.setLineWidth(2);
          doc.line(marginX, y - 10, marginX, y + 2);
          doc.text(l, marginX + 12, y);
          y += 14;
        }
      });
      y += 6;
    } else if (block.type === 'break') {
      y += 8;
    }
  }

  // ── Footer on every page ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(152, 160, 175);
    doc.text('CSEF Content Studio', marginX, pageHeight - 30);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 30, { align: 'right' });
  }

  doc.save(filename);
}

// ─────────── HISTORY ───────────

// A history entry: { id, modeId, modeTitle, snippet, timestamp, inputs, output }
function addHistoryEntry(history, modeId, modeTitle, inputs, output) {
  const snippet = (output || '').replace(/[#*═►]/g, '').trim().slice(0, 120);
  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    modeId,
    modeTitle,
    inputs: { ...inputs },
    output,
    snippet,
    timestamp: Date.now(),
  };
  const next = [entry, ...history].slice(0, HISTORY_LIMIT);
  return next;
}

function formatRelativeTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}



// ─────────── PERSISTENCE ───────────

const loadState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return {};
};

const saveState = (state) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
};

// ─────────── MODES ───────────

const MODES = {
  interviewPrep: {
    id: 'interviewPrep',
    category: 'pre-event',
    icon: ClipboardCheck,
    title: 'Interview Prep Sheet',
    tagline: 'Show up sharp and memorable',
    description: 'For guests being interviewed on the Experience POWER podcast. Generate story angles, talking points, anticipated questions with draft answers, and a signature story to have ready.',
    buttonLabel: 'Build my prep sheet',
    inputs: [
      { key: 'guestName', label: 'Guest name', placeholder: 'e.g., Julia Souder', required: true },
      { key: 'guestRole', label: 'Role / title', placeholder: 'e.g., President & CEO' },
      { key: 'guestCompany', label: 'Company / organization', placeholder: 'e.g., Long Duration Energy Storage Council' },
      { key: 'guestExpertise', label: 'Areas of expertise / topics to cover', placeholder: 'What are they known for? What do they want to talk about? (e.g., long-duration storage, grid reliability, load growth from AI/data centers, nuclear buildout, natural gas + renewables integration)', multiline: true, rows: 4 },
      { key: 'additionalContext', label: 'Anything else worth knowing (optional)', placeholder: 'Recent projects, upcoming initiatives, unique angles, current regulatory battles...', multiline: true, rows: 3 },
    ],
  },
  showPrep: {
    id: 'showPrep',
    category: 'pre-event',
    icon: Search,
    title: 'Host Prep Brief',
    tagline: 'Research the guest, plan the arc',
    description: 'For the Experience POWER podcast host. Paste what you know about the guest (bio, press kit, LinkedIn) and Claude will supplement with online research to deliver a snapshot, recent work, 10 ranked interview questions, questions to avoid, and clip-worthy moments to steer toward.',
    buttonLabel: 'Research and prep',
    hasWebSearch: true,
    inputs: [
      { key: 'guestName', label: 'Guest name', placeholder: 'e.g., Ali Zaidi', required: true },
      { key: 'guestRole', label: 'Role / title', placeholder: 'e.g., Former White House National Climate Advisor' },
      { key: 'guestCompany', label: 'Company / organization', placeholder: 'e.g., Lazard' },
      { key: 'guestFacts', label: 'What you already know about the guest (bio, press kit, LinkedIn summary)', placeholder: 'Paste their bio, press kit language, LinkedIn "About" section, or anything else you already know is accurate. Claude will treat this as the source of truth and only supplement with online research.', multiline: true, rows: 6 },
      { key: 'knownTopics', label: 'Anything specific you want the interview to focus on (optional)', placeholder: 'Recent news, specific projects, angles you want to cover (e.g., nuclear renaissance, IRA implementation, grid interconnection queue reform)...', multiline: true, rows: 3 },
    ],
  },
  contentFromInterview: {
    id: 'contentFromInterview',
    category: 'post-event',
    icon: LayoutGrid,
    title: 'Content Package',
    tagline: 'Complete post-interview kit',
    description: 'Full content package from a completed interview: 10 quotable moments, 5 LinkedIn posts for Experience POWER, 5 LinkedIn posts for the guest, 3 clip concepts, 3 follow-up content ideas.',
    buttonLabel: 'Generate content package',
    inputs: [
      { key: 'guestName', label: 'Guest name', placeholder: 'e.g., Maria Robinson' },
      { key: 'guestRole', label: 'Role / title', placeholder: 'e.g., Assistant Secretary' },
      { key: 'guestCompany', label: 'Company / organization', placeholder: 'e.g., U.S. Department of Energy' },
      { key: 'transcript', label: 'Interview transcript', placeholder: 'Paste the full transcript here...', multiline: true, rows: 12, required: true },
    ],
  },
  showNotes: {
    id: 'showNotes',
    category: 'post-event',
    icon: FileText,
    title: 'Show Notes',
    tagline: 'Episode descriptions and metadata',
    description: 'Professional show notes for Apple Podcasts, Spotify, and other platforms. Includes 3 title options, short/long descriptions, timestamps, guest bio, resources, and SEO tags.',
    buttonLabel: 'Write show notes',
    inputs: [
      { key: 'guestName', label: 'Guest name', placeholder: 'e.g., Aaron Zubaty' },
      { key: 'guestRole', label: 'Role / title', placeholder: 'e.g., CEO' },
      { key: 'guestCompany', label: 'Company / organization', placeholder: 'e.g., Eolian' },
      { key: 'transcript', label: 'Transcript OR episode summary', placeholder: 'Paste the full transcript or a summary of what was covered...', multiline: true, rows: 10, required: true },
    ],
  },
  linkedinPlaybook: {
    id: 'linkedinPlaybook',
    category: 'post-event',
    icon: CalendarClock,
    title: '8-Week LinkedIn Playbook',
    tagline: 'Personal-brand rollout for guests',
    description: 'A suggested 8-week LinkedIn rollout schedule for someone who appeared on the podcast. Each week gets a specific post with full text, visual guidance, hashtags, and timing.',
    buttonLabel: 'Build my rollout',
    inputs: [
      { key: 'guestName', label: 'Your name', placeholder: 'e.g., John Ketchum', required: true },
      { key: 'guestRole', label: 'Your role / title', placeholder: 'e.g., Chairman, President & CEO' },
      { key: 'guestCompany', label: 'Your organization', placeholder: 'e.g., NextEra Energy' },
      { key: 'interviewHighlights', label: 'Interview highlights or transcript', placeholder: 'Paste the transcript OR summarize the key topics you covered in the interview...', multiline: true, rows: 10, required: true },
    ],
  },
  publishingOptimizer: {
    id: 'publishingOptimizer',
    category: 'post-event',
    icon: SlidersHorizontal,
    title: 'Publishing Optimizer',
    tagline: 'Platform-tuned metadata',
    description: 'Titles, descriptions, and metadata optimized for Apple Podcasts, Spotify, and YouTube. Includes exact character counts, YouTube chapters, thumbnail text ideas, and keyword strategy.',
    buttonLabel: 'Optimize for platforms',
    inputs: [
      { key: 'guestName', label: 'Guest name' },
      { key: 'guestRole', label: 'Role / title' },
      { key: 'guestCompany', label: 'Company / organization' },
      { key: 'episodeContent', label: 'Episode summary or transcript', placeholder: 'Paste transcript OR a good summary of what was covered...', multiline: true, rows: 10, required: true },
    ],
  },
};

const MODE_ORDER = ['interviewPrep', 'showPrep', 'contentFromInterview', 'showNotes', 'linkedinPlaybook', 'publishingOptimizer'];

// ─────────── MAIN APP ───────────

export default function App() {
  const [screen, setScreen] = useState('home'); // home | mode
  const [currentModeId, setCurrentModeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [state, setState] = useState(() => {
    const stored = loadState();
    return {
      // Global context — used across every generation
      audience: stored.audience || '',
      voice: stored.voice || '',
      goals: stored.goals || '',
      // Per-mode inputs
      inputs: stored.inputs || {},
      // Per-mode outputs (current/latest per mode)
      outputs: stored.outputs || {},
      // Rolling history across all modes (max 10)
      history: stored.history || [],
    };
  });

  useEffect(() => { saveState(state); }, [state]);

  const currentMode = currentModeId ? MODES[currentModeId] : null;

  const updateInput = useCallback((modeId, key, value) => {
    setState(prev => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        [modeId]: { ...(prev.inputs[modeId] || {}), [key]: value },
      },
    }));
  }, []);

  const updateContext = useCallback((key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const restoreFromHistory = useCallback((entry) => {
    setState(prev => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        [entry.modeId]: { ...(entry.inputs || {}) },
      },
      outputs: {
        ...prev.outputs,
        [entry.modeId]: entry.output,
      },
    }));
    setCurrentModeId(entry.modeId);
  }, []);

  const clearHistory = useCallback(() => {
    if (confirm('Clear all recent outputs? Your current mode outputs will still be saved.')) {
      setState(prev => ({ ...prev, history: [] }));
    }
  }, []);

  const callBackend = async (mode, payload) => {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, payload }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Try again in a moment.');
    }
    const data = await response.json();
    return data.result;
  };

  const handleGenerate = async () => {
    if (!currentMode) return;
    const modeInputs = state.inputs[currentMode.id] || {};

    // Validate required fields
    for (const inp of currentMode.inputs) {
      if (inp.required && !((modeInputs[inp.key] || '').trim())) {
        setError(`"${inp.label}" is required.`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setState(prev => ({
      ...prev,
      outputs: { ...prev.outputs, [currentMode.id]: '' },
    }));

    try {
      const payload = {
        ...modeInputs,
        audience: state.audience,
        voice: state.voice,
        goals: state.goals,
      };
      const result = await callBackend(currentMode.id, payload);
      setState(prev => ({
        ...prev,
        outputs: { ...prev.outputs, [currentMode.id]: result },
        history: addHistoryEntry(prev.history || [], currentMode.id, currentMode.title, modeInputs, result),
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const enterMode = (modeId) => {
    setCurrentModeId(modeId);
    setScreen('mode');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setScreen('home');
    setCurrentModeId(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyOutput = async () => {
    const output = state.outputs[currentMode?.id];
    if (!output) return;
    await navigator.clipboard.writeText(markdownToPlainText(output));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearInput = (key) => {
    if (confirm('Clear this field?')) {
      updateInput(currentMode.id, key, '');
    }
  };

  return (
    <div className="min-h-screen">
      <Header onHome={goHome} />

      {screen === 'home' && (
        <HomeView
          onEnterMode={enterMode}
          state={state}
          updateContext={updateContext}
          onRestoreHistory={restoreFromHistory}
          onClearHistory={clearHistory}
        />
      )}

      {screen === 'mode' && currentMode && (
        <ModeView
          mode={currentMode}
          inputs={state.inputs[currentMode.id] || {}}
          output={state.outputs[currentMode.id] || ''}
          loading={loading}
          error={error}
          copied={copied}
          onUpdateInput={(k, v) => updateInput(currentMode.id, k, v)}
          onClearInput={clearInput}
          onGenerate={handleGenerate}
          onCopy={copyOutput}
          onHome={goHome}
        />
      )}
    </div>
  );
}

// ─────────── HEADER ───────────

function Header({ onHome }) {
  return (
    <header style={{
      background: C.gradHeader,
      backdropFilter: 'blur(20px) saturate(1.2)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
      borderBottom: `1px solid ${C.ruleStrong}`,
      boxShadow: `
        0 12px 32px rgba(0, 0, 0, 0.5),
        0 4px 12px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.06)
      `,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Illuminated teal→red hairline — the "power on" light strip */}
      <div style={{
        position: 'absolute',
        bottom: -1,
        left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${C.teal} 20%, ${C.green} 50%, ${C.red} 80%, transparent 100%)`,
        opacity: 0.8,
        boxShadow: '0 0 16px rgba(60, 168, 180, 0.5)',
      }} />

      <div className="max-w-5xl mx-auto px-6 py-5">
        <button onClick={onHome} className="flex items-center gap-6 group" style={{ background: 'transparent', border: 'none', padding: 0 }}>
          <img
            src="/ep-logo.png"
            alt="Experience POWER"
            style={{
              height: 44, width: 'auto', display: 'block',
              filter: 'drop-shadow(0 2px 8px rgba(228, 24, 36, 0.25))',
            }}
          />
          <div style={{
            borderLeft: `1px solid ${C.ruleStrong}`,
            paddingLeft: 24,
            textAlign: 'left',
          }}>
            <div className="mono" style={{
              fontSize: 10,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: C.teal,
              marginBottom: 4,
              fontWeight: 700,
            }}>
              Content Studio
            </div>
            <div className="display" style={{
              color: C.text,
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}>
              Podcast Programming Platform
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}

// ─────────── HOME ───────────

function HomeView({ onEnterMode, state, updateContext, onRestoreHistory, onClearHistory }) {
  const [showContext, setShowContext] = useState(false);
  const preEventModes = MODE_ORDER.filter(id => MODES[id].category === 'pre-event');
  const postEventModes = MODE_ORDER.filter(id => MODES[id].category === 'post-event');

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 fade-up">
      {/* Hero */}
      <div className="mb-12">
        <div className="mono" style={{
          fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: C.teal, marginBottom: 16, fontWeight: 700,
        }}>
          <span style={{ color: C.textFaded }}>01 &nbsp;/&nbsp; </span>Experience POWER · Sept 28–30, 2026 · Washington D.C.
        </div>
        <h1 className="display-heavy" style={{
          fontSize: 52, color: C.text, marginBottom: 20,
          lineHeight: 1.02, maxWidth: 820,
        }}>
          Content platform for<br />
          <span style={{
            background: C.gradPower,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
          }}>the Experience POWER podcast.</span>
        </h1>
        <p style={{ fontSize: 18, color: C.textMuted, lineHeight: 1.6, maxWidth: 720, fontWeight: 400 }}>
          Prep for your interview, generate post-event content, and build a rollout schedule — purpose-built for utility leaders, grid operators, EPCs, and technology providers shaping the future of power generation and infrastructure.
        </p>
      </div>

      {/* Global context (collapsible) */}
      <div style={{
        border: `1px solid ${C.rule}`,
        background: C.glass,
        backdropFilter: 'blur(12px) saturate(1.05)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.05)',
        marginBottom: 48,
        boxShadow: C.shadowMd,
        position: 'relative',
      }}>
        {/* Corner brackets */}
        <div style={{
          position: 'absolute', top: 6, left: 6, width: 10, height: 10,
          borderTop: `1px solid ${C.brassLight}`, borderLeft: `1px solid ${C.brassLight}`,
          opacity: 0.5,
        }} />
        <div style={{
          position: 'absolute', top: 6, right: 6, width: 10, height: 10,
          borderTop: `1px solid ${C.brassLight}`, borderRight: `1px solid ${C.brassLight}`,
          opacity: 0.5,
        }} />

        <button
          onClick={() => setShowContext(!showContext)}
          className="w-full flex items-center justify-between"
          style={{ padding: '20px 26px', background: 'transparent', border: 'none' }}
        >
          <div className="flex items-center gap-4">
            <div style={{
              width: 36, height: 36,
              background: C.brassPale,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(184, 147, 92, 0.15)`,
            }}>
              <Building2 size={15} style={{ color: C.brass }} strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: '-0.005em' }}>
                Session context
              </div>
              <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 3 }}>
                {state.audience || state.voice || state.goals
                  ? 'Custom context is being applied to all generations'
                  : 'Optional — add specifics that apply across every tool'}
              </div>
            </div>
          </div>
          <ChevronRight size={16} style={{
            color: C.inkMuted,
            transform: showContext ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        </button>
        {showContext && (
          <div style={{ padding: '4px 26px 24px', borderTop: `1px solid ${C.rule}` }}>
            <ContextField
              label="Audience refinement"
              hint="Anything specific about who's being reached — e.g., 'FIFA World Cup host city officials specifically' or 'Kansas City delegation'"
              value={state.audience}
              onChange={v => updateContext('audience', v)}
            />
            <ContextField
              label="Voice notes"
              hint="Tone adjustments beyond the default — e.g., 'Skew more data-driven than narrative' or 'Emphasize public-sector angle'"
              value={state.voice}
              onChange={v => updateContext('voice', v)}
            />
            <ContextField
              label="Content goals"
              hint="What we're optimizing for — e.g., 'Drive sponsor lead generation' or 'Build attendee retention for 2027'"
              value={state.goals}
              onChange={v => updateContext('goals', v)}
            />
          </div>
        )}
      </div>

      {/* Pre-event section */}
      <div className="mb-14">
        <SectionHeader
          number="02"
          eyebrow="Before The Interview"
          title="Show up prepared"
          description="Whether you're the guest getting interviewed or the host preparing to conduct the conversation, walk in ready."
        />
        <div className="grid md:grid-cols-2 gap-5">
          {preEventModes.map(id => (
            <ModeCard key={id} mode={MODES[id]} onClick={() => onEnterMode(id)} hasOutput={!!state.outputs[id]} />
          ))}
        </div>
      </div>

      {/* Post-event section */}
      <div className="mb-14">
        <SectionHeader
          number="03"
          eyebrow="After The Interview"
          title="Turn one conversation into weeks of content"
          description="Post-interview content generation for POWER's marketing, the guest's personal brand, and every publishing platform."
        />
        <div className="grid md:grid-cols-2 gap-5">
          {postEventModes.map(id => (
            <ModeCard key={id} mode={MODES[id]} onClick={() => onEnterMode(id)} hasOutput={!!state.outputs[id]} />
          ))}
        </div>
      </div>

      {/* Recent Outputs — shows only when history has entries */}
      {state.history && state.history.length > 0 && (
        <div style={{
          background: C.glass,
          backdropFilter: 'blur(16px) saturate(1.1)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.1)',
          border: `1px solid ${C.rule}`,
          padding: '24px 26px',
          marginBottom: 32,
          boxShadow: C.shadowLg,
          position: 'relative',
        }}>
          {/* Corner brackets */}
          <div style={{ position: 'absolute', top: 6, left: 6, width: 10, height: 10, borderTop: `1px solid ${C.brass}`, borderLeft: `1px solid ${C.brass}`, opacity: 0.6 }} />
          <div style={{ position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderTop: `1px solid ${C.brass}`, borderRight: `1px solid ${C.brass}`, opacity: 0.6 }} />
          <div style={{ position: 'absolute', bottom: 6, left: 6, width: 10, height: 10, borderBottom: `1px solid ${C.brass}`, borderLeft: `1px solid ${C.brass}`, opacity: 0.6 }} />
          <div style={{ position: 'absolute', bottom: 6, right: 6, width: 10, height: 10, borderBottom: `1px solid ${C.brass}`, borderRight: `1px solid ${C.brass}`, opacity: 0.6 }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, background: C.brassPale,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <History size={15} style={{ color: C.brass }} strokeWidth={1.5} />
              </div>
              <div>
                <div className="mono" style={{
                  fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
                  color: C.brass, fontWeight: 700, marginBottom: 2,
                }}>
                  Recent Outputs
                </div>
                <div style={{ fontSize: 13, color: C.inkMuted }}>
                  Your last {state.history.length} {state.history.length === 1 ? 'generation' : 'generations'} — click to restore
                </div>
              </div>
            </div>
            <button
              onClick={onClearHistory}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: `1px solid ${C.rule}`,
                color: C.inkMuted,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blueDeep; e.currentTarget.style.color = C.blueDeep; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.rule; e.currentTarget.style.color = C.inkMuted; }}
            >
              <Trash2 size={11} strokeWidth={1.8} /> Clear
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {state.history.map(entry => {
              const mode = MODES[entry.modeId];
              const Icon = mode?.icon || FileText;
              return (
                <button
                  key={entry.id}
                  onClick={() => onRestoreHistory(entry)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 14px',
                    background: C.white,
                    border: `1px solid ${C.rule}`,
                    textAlign: 'left',
                    boxShadow: C.shadowSm,
                    cursor: 'pointer',
                    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = C.blueDeep;
                    e.currentTarget.style.transform = 'translateX(2px)';
                    e.currentTarget.style.boxShadow = C.shadowMd;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.rule;
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = C.shadowSm;
                  }}
                >
                  <div style={{
                    width: 32, height: 32,
                    background: C.gradIcon,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  }}>
                    <Icon size={15} style={{ color: C.white }} strokeWidth={1.5} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                      <div className="display" style={{
                        fontSize: 14, fontWeight: 500, color: C.ink,
                        letterSpacing: '-0.01em',
                      }}>
                        {entry.modeTitle}
                      </div>
                      <div className="mono" style={{
                        fontSize: 10, color: C.inkFaded, letterSpacing: '0.1em',
                      }}>
                        {formatRelativeTime(entry.timestamp)}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 12, color: C.inkMuted, lineHeight: 1.45,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {entry.snippet || 'No preview'}
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: C.inkMuted, flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* First-time tip */}
      <div style={{
        background: `rgba(245, 239, 226, 0.7)`,
        backdropFilter: 'blur(12px) saturate(1.05)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.05)',
        border: `1px solid ${C.brassLight}`,
        borderLeft: `3px solid ${C.brass}`,
        padding: '22px 26px',
        marginTop: 32,
        boxShadow: C.shadowMd,
        position: 'relative',
      }}>
        {/* Corner brackets */}
        <div style={{
          position: 'absolute', top: 6, right: 6, width: 10, height: 10,
          borderTop: `1px solid ${C.brass}`, borderRight: `1px solid ${C.brass}`,
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', bottom: 6, right: 6, width: 10, height: 10,
          borderBottom: `1px solid ${C.brass}`, borderRight: `1px solid ${C.brass}`,
          opacity: 0.6,
        }} />

        <div className="flex items-start gap-4">
          <Lightbulb size={18} style={{ color: C.brass }} className="flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <div className="mono" style={{
              fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
              color: C.brass, fontWeight: 700, marginBottom: 8,
            }}>
              First time using this
            </div>
            <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.65 }}>
              If you're a sponsor or speaker being interviewed, start with <strong style={{ color: C.blueDeep }}>Interview Prep Sheet</strong>. After your interview, use <strong style={{ color: C.blueDeep }}>Content Package</strong> and then <strong style={{ color: C.blueDeep }}>8-Week LinkedIn Playbook</strong> to extend the value of your appearance. Your inputs auto-save as you type.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description, number }) {
  return (
    <div className="mb-6">
      <div className="mono" style={{
        fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: C.brass, fontWeight: 600, marginBottom: 10,
      }}>
        {number && <span style={{ color: C.inkFaded }}>{number} &nbsp;/&nbsp; </span>}{eyebrow}
      </div>
      <h2 className="display-heavy" style={{
        fontSize: 32, color: C.ink, marginBottom: 8, lineHeight: 1.1,
      }}>
        {title}
      </h2>
      <p style={{ fontSize: 16, color: C.inkMuted, lineHeight: 1.6, maxWidth: 640 }}>
        {description}
      </p>
    </div>
  );
}

function ModeCard({ mode, onClick, hasOutput }) {
  const Icon = mode.icon;
  const [isHover, setIsHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="text-left group"
      style={{
        border: `1px solid ${isHover ? C.blueDeep : C.rule}`,
        background: isHover ? C.glassHover : C.glass,
        backdropFilter: 'blur(16px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.1)',
        padding: '26px 24px',
        boxShadow: isHover ? C.shadowXl : C.shadowMd,
        transform: isHover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
      }}
    >
      {/* Corner brackets — architectural drawing marks */}
      <div style={{
        position: 'absolute', top: 6, left: 6,
        width: 10, height: 10,
        borderTop: `1px solid ${isHover ? C.brass : C.brassLight}`,
        borderLeft: `1px solid ${isHover ? C.brass : C.brassLight}`,
        opacity: isHover ? 0.9 : 0.5,
        transition: 'opacity 320ms ease',
      }} />
      <div style={{
        position: 'absolute', top: 6, right: 6,
        width: 10, height: 10,
        borderTop: `1px solid ${isHover ? C.brass : C.brassLight}`,
        borderRight: `1px solid ${isHover ? C.brass : C.brassLight}`,
        opacity: isHover ? 0.9 : 0.5,
        transition: 'opacity 320ms ease',
      }} />
      <div style={{
        position: 'absolute', bottom: 6, left: 6,
        width: 10, height: 10,
        borderBottom: `1px solid ${isHover ? C.brass : C.brassLight}`,
        borderLeft: `1px solid ${isHover ? C.brass : C.brassLight}`,
        opacity: isHover ? 0.9 : 0.5,
        transition: 'opacity 320ms ease',
      }} />
      <div style={{
        position: 'absolute', bottom: 6, right: 6,
        width: 10, height: 10,
        borderBottom: `1px solid ${isHover ? C.brass : C.brassLight}`,
        borderRight: `1px solid ${isHover ? C.brass : C.brassLight}`,
        opacity: isHover ? 0.9 : 0.5,
        transition: 'opacity 320ms ease',
      }} />

      <div className="flex items-start gap-5" style={{ position: 'relative' }}>
        {/* Illuminated icon panel */}
        <div style={{
          width: 48, height: 48,
          background: C.gradIcon,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isHover ? C.shadowIconHover : C.shadowIcon,
          position: 'relative',
          transition: 'all 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Inner light highlight — top-left specular */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: C.gradIconInset,
            pointerEvents: 'none',
          }} />
          <Icon size={22} style={{ color: C.white, position: 'relative', zIndex: 1 }} strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="display" style={{
              fontSize: 19, fontWeight: 500, color: C.ink, lineHeight: 1.2,
              letterSpacing: '-0.015em',
            }}>
              {mode.title}
            </div>
            {hasOutput && (
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: C.success,
                boxShadow: `0 0 0 3px rgba(5, 150, 105, 0.15), 0 0 8px rgba(5, 150, 105, 0.4)`,
              }} title="Has saved output" />
            )}
          </div>
          <div className="mono" style={{
            fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: C.brass, marginBottom: 10, fontWeight: 700,
          }}>
            {mode.tagline}
          </div>
          <p style={{ fontSize: 13.5, color: C.inkMuted, lineHeight: 1.6, marginBottom: 0 }}>
            {mode.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function ContextField({ label, hint, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 4,
      }}>
        {label}
      </label>
      <div style={{ fontSize: 12, color: C.inkMuted, marginBottom: 6 }}>{hint}</div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Optional"
        style={{
          width: '100%', padding: '8px 12px', border: `1px solid ${C.rule}`,
          background: C.paper, color: C.ink, fontSize: 14,
        }}
      />
    </div>
  );
}

// ─────────── MODE VIEW ───────────

function ModeView({ mode, inputs, output, loading, error, copied, onUpdateInput, onClearInput, onGenerate, onCopy, onHome }) {
  const Icon = mode.icon;
  return (
    <div className="max-w-4xl mx-auto px-6 py-6 fade-up">
      {/* Breadcrumb */}
      <button onClick={onHome} className="mono flex items-center gap-2 mb-6 transition-colors"
        style={{
          fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
          color: C.inkMuted, fontWeight: 500,
        }}
        onMouseEnter={e => e.currentTarget.style.color = C.blue}
        onMouseLeave={e => e.currentTarget.style.color = C.inkMuted}>
        <ArrowLeft size={13} /> All tools
      </button>

      {/* Title */}
      <div className="flex items-start gap-5 mb-10">
        <div style={{
          width: 60, height: 60,
          background: C.gradIcon,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: C.shadowIconHover,
          position: 'relative',
        }}>
          {/* Inner light highlight */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: C.gradIconInset,
            pointerEvents: 'none',
          }} />
          <Icon size={26} style={{ color: C.white, position: 'relative', zIndex: 1 }} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="mono" style={{
            fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: C.brass, marginBottom: 6, fontWeight: 700,
          }}>
            {mode.tagline}
          </div>
          <h1 className="display-heavy" style={{
            fontSize: 42, color: C.ink, lineHeight: 1.02,
            marginBottom: 12,
          }}>
            {mode.title}
          </h1>
          <p style={{ fontSize: 16, color: C.inkMuted, lineHeight: 1.6, maxWidth: 600 }}>
            {mode.description}
          </p>
        </div>
      </div>

      {mode.hasWebSearch && (
        <div style={{
          border: `1px solid ${C.brassLight}`,
          background: C.brassPale,
          padding: '12px 18px',
          marginBottom: 24,
          fontSize: 13,
          color: C.inkSoft,
          boxShadow: C.shadowSm,
        }}>
          <span className="mono" style={{
            fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
            color: C.brass, fontWeight: 700,
          }}>
            Uses Web Search
          </span>
          <span style={{ color: C.inkMuted }}>{' — '}This tool researches your guest online. Takes 30-90 seconds.</span>
        </div>
      )}

      {/* Inputs */}
      <div style={{
        border: `1px solid ${C.rule}`,
        background: C.glassStrong,
        backdropFilter: 'blur(16px) saturate(1.05)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.05)',
        padding: 32, marginBottom: 24,
        boxShadow: C.shadowLg,
        position: 'relative',
      }}>
        {/* Corner brackets */}
        <div style={{
          position: 'absolute', top: 8, left: 8, width: 12, height: 12,
          borderTop: `1px solid ${C.brass}`, borderLeft: `1px solid ${C.brass}`,
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', top: 8, right: 8, width: 12, height: 12,
          borderTop: `1px solid ${C.brass}`, borderRight: `1px solid ${C.brass}`,
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', bottom: 8, left: 8, width: 12, height: 12,
          borderBottom: `1px solid ${C.brass}`, borderLeft: `1px solid ${C.brass}`,
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', bottom: 8, right: 8, width: 12, height: 12,
          borderBottom: `1px solid ${C.brass}`, borderRight: `1px solid ${C.brass}`,
          opacity: 0.6,
        }} />
        {/* Illuminated brass top hairline */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${C.brassLight} 30%, ${C.brassLight} 70%, transparent 100%)`,
          opacity: 0.6,
        }} />

        {mode.inputs.map(inp => (
          <InputField
            key={inp.key}
            input={inp}
            value={inputs[inp.key] || ''}
            onChange={v => onUpdateInput(inp.key, v)}
            onClear={() => onClearInput(inp.key)}
          />
        ))}

        <button
          onClick={onGenerate}
          disabled={loading}
          style={{
            width: '100%', padding: '18px', marginTop: 16,
            background: loading ? C.inkFaded : C.gradBlue,
            color: C.white, border: 'none',
            fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            boxShadow: loading ? 'none' : C.shadowButton,
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.background = C.gradBlueHover;
              e.currentTarget.style.boxShadow = C.shadowButtonHover;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              e.currentTarget.style.background = C.gradBlue;
              e.currentTarget.style.boxShadow = C.shadowButton;
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {/* Specular top highlight on button */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Working on it</>
            : <><Sparkles size={14} strokeWidth={1.8} /> {mode.buttonLabel}</>}
        </button>

        {loading && (
          <p style={{
            marginTop: 12, textAlign: 'center', fontSize: 12,
            color: C.inkMuted, fontStyle: 'italic',
          }}>
            Usually 15-60 seconds. Web search modes can take longer.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          border: `1px solid ${C.blueDark}`, background: C.blueSkySoft,
          padding: 16, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <AlertCircle size={18} style={{ color: C.blueDark, flexShrink: 0, marginTop: 2 }} />
          <div>
            <div className="mono" style={{
              fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: C.blueDark, fontWeight: 600, marginBottom: 4,
            }}>
              Heads up
            </div>
            <div style={{ fontSize: 14, color: C.ink }}>{error}</div>
          </div>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="print-target" style={{
          border: `1px solid ${C.rule}`,
          background: C.glassStrong,
          backdropFilter: 'blur(20px) saturate(1.1)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.1)',
          marginBottom: 24,
          boxShadow: C.shadowXl,
          position: 'relative',
        }}>
          {/* Print-only header (hidden on screen) */}
          <div className="print-header">
            <div className="print-brand">Experience POWER · Content Studio</div>
            <div className="print-title">{mode.title}</div>
            <div className="print-meta">
              {inputs?.guestName && (
                <>
                  Guest: <strong>{inputs.guestName}</strong>
                  {inputs?.guestRole && `, ${inputs.guestRole}`}
                  {inputs?.guestCompany && ` — ${inputs.guestCompany}`}
                  <br />
                </>
              )}
              {inputs?.episodeTitle && (
                <>Episode: <strong>{inputs.episodeTitle}</strong><br /></>
              )}
              Generated {new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
          </div>

          {/* Top illuminated blue accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${C.blueDeep} 0%, ${C.blue} 50%, ${C.blueBright} 100%)`,
            boxShadow: '0 0 12px rgba(0, 105, 180, 0.4)',
          }} />
          {/* Corner brackets */}
          <div style={{
            position: 'absolute', top: 10, left: 10, width: 12, height: 12,
            borderTop: `1px solid ${C.brass}`, borderLeft: `1px solid ${C.brass}`,
            opacity: 0.6,
          }} />
          <div style={{
            position: 'absolute', top: 10, right: 10, width: 12, height: 12,
            borderTop: `1px solid ${C.brass}`, borderRight: `1px solid ${C.brass}`,
            opacity: 0.6,
          }} />
          <div style={{
            position: 'absolute', bottom: 10, left: 10, width: 12, height: 12,
            borderBottom: `1px solid ${C.brass}`, borderLeft: `1px solid ${C.brass}`,
            opacity: 0.6,
          }} />
          <div style={{
            position: 'absolute', bottom: 10, right: 10, width: 12, height: 12,
            borderBottom: `1px solid ${C.brass}`, borderRight: `1px solid ${C.brass}`,
            opacity: 0.6,
          }} />

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '22px 30px',
            background: C.gradPanel,
            borderBottom: `1px solid ${C.rule}`,
          }}>
            <div>
              <div className="mono" style={{
                fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
                color: C.brass, fontWeight: 700, marginBottom: 4,
              }}>
                Output
              </div>
              <div className="display" style={{ fontSize: 20, fontWeight: 500, color: C.ink, letterSpacing: '-0.015em' }}>
                Your Result
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                onClick={() => downloadTextFile(
                  markdownToPlainText(output),
                  buildFilename(mode.title, inputs, 'txt')
                )}
                style={{
                  padding: '11px 14px',
                  border: `1px solid ${C.ruleStrong}`,
                  background: C.white,
                  color: C.inkSoft,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: C.shadowSm, cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = C.blueDeep;
                  e.currentTarget.style.color = C.blueDeep;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = C.ruleStrong;
                  e.currentTarget.style.color = C.inkSoft;
                }}
                title="Download as plain text (.txt)"
              >
                <Download size={12} strokeWidth={1.8} /> TXT
              </button>
              <button
                onClick={() => downloadPDF(
                  output,
                  buildFilename(mode.title, inputs, 'pdf'),
                  mode.title,
                  mode.tagline
                )}
                style={{
                  padding: '11px 14px',
                  border: `1px solid ${C.ruleStrong}`,
                  background: C.white,
                  color: C.inkSoft,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: C.shadowSm, cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = C.blueDeep;
                  e.currentTarget.style.color = C.blueDeep;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = C.ruleStrong;
                  e.currentTarget.style.color = C.inkSoft;
                }}
                title="Download as formatted PDF"
              >
                <FileDown size={12} strokeWidth={1.8} /> PDF
              </button>
              <button
                onClick={onCopy}
                style={{
                  padding: '11px 18px',
                  border: `1px solid ${copied ? C.success : C.ruleStrong}`,
                  background: copied ? C.success : C.white,
                  color: copied ? C.white : C.inkSoft,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: C.shadowSm, cursor: 'pointer',
                }}
              >
                {copied ? <><Check size={12} strokeWidth={2.5} /> Copied</> : <><Copy size={12} strokeWidth={1.8} /> Copy All</>}
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '11px 14px',
                  border: `1px solid ${C.ruleStrong}`,
                  background: C.white,
                  color: C.inkSoft,
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: C.shadowSm, cursor: 'pointer',
                }}
                title="Print or Save as PDF via your browser"
              >
                <Printer size={12} strokeWidth={1.8} /> Print
              </button>
            </div>
          </div>
          <div style={{ padding: '32px 36px' }}>
            <MarkdownOutput text={output} />
          </div>
          {/* Print-only footer (hidden on screen) */}
          <div className="print-footer">
            Experience POWER Content Studio · Prepared for internal use · BullRose Productions
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 40, paddingTop: 20, borderTop: `1px solid ${C.rule}`,
        textAlign: 'center',
      }}>
        <div className="mono" style={{
          fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
          color: C.inkFaded, fontWeight: 500,
        }}>
          Experience POWER Content Studio · Your inputs auto-save
        </div>
      </div>
    </div>
  );
}

function InputField({ input, value, onChange, onClear }) {
  const hasValue = value && value.length > 0;
  return (
    <div style={{ marginBottom: 18, position: 'relative' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
          {input.label}
          {input.required && <span style={{ color: C.blue, marginLeft: 4 }}>*</span>}
        </label>
        {hasValue && (
          <button
            onClick={onClear}
            className="mono flex items-center gap-1 transition-colors"
            style={{
              fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: C.inkFaded, padding: '2px 6px',
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.blue}
            onMouseLeave={e => e.currentTarget.style.color = C.inkFaded}
          >
            <RefreshCw size={10} /> Clear
          </button>
        )}
      </div>
      {input.multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={input.placeholder}
          rows={input.rows || 4}
          style={{
            width: '100%', padding: '10px 14px', border: `1px solid ${C.rule}`,
            background: C.paper, color: C.ink, fontSize: 15, resize: 'vertical',
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={input.placeholder}
          style={{
            width: '100%', padding: '10px 14px', border: `1px solid ${C.rule}`,
            background: C.paper, color: C.ink, fontSize: 15,
          }}
        />
      )}
    </div>
  );
}
