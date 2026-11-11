import React from 'react';
import DOMPurify from 'dompurify';

interface SafeMathHtmlProps {
  html: string;
  className?: string;
}

export const SafeMathHtml: React.FC<SafeMathHtmlProps> = ({ html, className = '' }) => {
  if (!html) return <span className="text-slate-400 italic">No content</span>;

  // Configure DOMPurify to allow MathML tags and math attributes
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'p', 'span', 'br', 'strong', 'em', 'sub', 'sup',
      'ol', 'ul', 'li', 'table', 'tbody', 'tr', 'td', 'th',
      // MathML
      'math', 'mrow', 'mi', 'mn', 'mo', 'ms', 'mspace', 'mtext', 'mfrac',
      'msqrt', 'mroot', 'msub', 'msup', 'msubsup', 'munder', 'mover', 'munderover',
      'mtable', 'mtr', 'mtd', 'mstyle', 'merror', 'mpadded', 'mphantom', 'mfenced', 'semantics', 'annotation'
    ],
    ALLOWED_ATTR: [
      'style', 'class', 'color', 'display', 'xmlns', 'mathvariant', 'columnalign',
      'displaystyle', 'rowalign', 'stretchy', 'fence', 'form', 'separator',
      'width', 'height', 'linethickness', 'linebreak'
    ],
  });

  return (
    <div
      className={`rendered-academic-content ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};
