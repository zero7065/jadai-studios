'use client';

import React from 'react';
import CodeBlock from '../ui/CodeBlock';

interface OracleMessageContentProps {
  content: string;
}

export const OracleMessageContent: React.FC<OracleMessageContentProps> = ({ content }) => {
  // Regex to extract markdown code blocks ```lang\ncode```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(renderTextWithInlineCode(textBefore, `text-${lastIndex}`));
    }

    const language = match[1] || 'code';
    const code = match[2].trim();
    parts.push(
      <div key={`code-${match.index}`} className="my-2.5">
        <CodeBlock code={code} language={language} title={`${language.toUpperCase()} SNIPPET`} />
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    parts.push(renderTextWithInlineCode(remainingText, `text-${lastIndex}`));
  }

  return <div className="space-y-1.5 select-text">{parts}</div>;
};

function renderTextWithInlineCode(text: string, keyPrefix: string): React.ReactNode {
  // Check for inline backticks `code`
  const inlineCodeRegex = /`([^`]+)`/g;
  const subParts: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = inlineCodeRegex.exec(text)) !== null) {
    const rawBefore = text.substring(lastIdx, m.index);
    if (rawBefore) {
      subParts.push(<span key={`${keyPrefix}-raw-${lastIdx}`}>{rawBefore}</span>);
    }

    const code = m[1];
    subParts.push(
      <CodeBlock key={`${keyPrefix}-inline-${m.index}`} code={code} inline={true} />
    );

    lastIdx = m.index + m[0].length;
  }

  const rawRemaining = text.substring(lastIdx);
  if (rawRemaining) {
    subParts.push(<span key={`${keyPrefix}-raw-${lastIdx}`}>{rawRemaining}</span>);
  }

  return (
    <div key={keyPrefix} className="whitespace-pre-wrap leading-relaxed">
      {subParts}
    </div>
  );
}

export default OracleMessageContent;
