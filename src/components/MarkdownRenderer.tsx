import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

export function MarkdownRenderer({ children, className }: MarkdownRendererProps) {
  return (
    <div className={`markdown-body ${className || ''}`}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
