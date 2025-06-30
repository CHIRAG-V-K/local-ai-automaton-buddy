
import React from 'react';
import { CodeBlock } from './CodeBlock';

interface MessageContentProps {
  content: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  // Regex to match code blocks with optional language specification
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  // Split content by code blocks
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index).trim();
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }
    
    // Add code block
    const language = match[1] || 'text';
    const code = match[2].trim();
    if (code) {
      parts.push({ type: 'code', content: code, language });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    const remainingContent = content.slice(lastIndex).trim();
    if (remainingContent) {
      parts.push({ type: 'text', content: remainingContent });
    }
  }
  
  // If no code blocks found, return the original content
  if (parts.length === 0) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  return (
    <div>
      {parts.map((part, index) => (
        <div key={index}>
          {part.type === 'text' ? (
            <span className="whitespace-pre-wrap">{part.content}</span>
          ) : (
            <CodeBlock code={part.content} language={part.language} />
          )}
        </div>
      ))}
    </div>
  );
};
