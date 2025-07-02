
import { CodeBlock } from "./CodeBlock";

interface MessageContentProps {
  content: string;
}

type ContentPart = {
  type: 'text' | 'code' | 'highlight';
  content: string;
  language?: string;
};

export const MessageContent = ({ content }: MessageContentProps) => {
  const parseContent = (text: string): ContentPart[] => {
    const parts: ContentPart[] = [];
    let currentIndex = 0;

    // First, find all code blocks
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const highlightRegex = /\*\*(.*?)\*\*/g;
    
    // Collect all matches with their positions
    const matches: Array<{ type: 'code' | 'highlight'; start: number; end: number; content: string; language?: string }> = [];
    
    let match;
    
    // Find code blocks
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push({
        type: 'code',
        start: match.index,
        end: match.index + match[0].length,
        content: match[2] || '',
        language: match[1] || 'text'
      });
    }
    
    // Find highlights
    while ((match = highlightRegex.exec(text)) !== null) {
      matches.push({
        type: 'highlight',
        start: match.index,
        end: match.index + match[0].length,
        content: match[1] || ''
      });
    }
    
    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);
    
    // Build parts array
    matches.forEach((match) => {
      // Add text before this match
      if (currentIndex < match.start) {
        const textContent = text.slice(currentIndex, match.start);
        if (textContent) {
          parts.push({ type: 'text', content: textContent });
        }
      }
      
      // Add the match
      parts.push({
        type: match.type,
        content: match.content,
        language: match.language
      });
      
      currentIndex = match.end;
    });
    
    // Add remaining text
    if (currentIndex < text.length) {
      const textContent = text.slice(currentIndex);
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }
    
    // If no matches found, return the entire content as text
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }
    
    return parts;
  };

  const parts = parseContent(content);

  return (
    <div className="message-content">
      {parts.map((part, index) => {
        switch (part.type) {
          case 'code':
            return (
              <CodeBlock
                key={index}
                code={part.content}
                language={part.language || 'text'}
              />
            );
          case 'highlight':
            return (
              <span
                key={index}
                className="highlight-text px-1.5 py-0.5 mx-0.5 rounded-md bg-yellow-200/80 dark:bg-yellow-800/40 text-yellow-900 dark:text-yellow-200 font-medium"
              >
                {part.content}
              </span>
            );
          case 'text':
          default:
            return (
              <span key={index} className="whitespace-pre-wrap">
                {part.content}
              </span>
            );
        }
      })}
    </div>
  );
};
