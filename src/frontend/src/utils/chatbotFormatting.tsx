import React from 'react';

/**
 * Formats plain-text chatbot responses into readable JSX
 * Preserves line breaks and converts bullet-style lines into list items
 */
export function formatChatbotResponse(text: string): React.ReactNode {
  if (!text || text.trim().length === 0) {
    return "I'm sorry, I couldn't generate a proper response. Please try asking again or visit the Doctors page to browse available specialists.";
  }

  // Split by line breaks
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-2">
          {currentParagraph.join(' ')}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside mb-2 space-y-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="ml-2">
              {item}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Empty line - flush current content
    if (trimmedLine.length === 0) {
      flushList();
      flushParagraph();
      return;
    }

    // Check if line is a bullet point (starts with -, *, •, or number followed by dot/parenthesis)
    const isBullet = /^[-*•]\s/.test(trimmedLine) || /^\d+[.)]\s/.test(trimmedLine);
    const isLetterBullet = /^[a-z][.)]\s/i.test(trimmedLine);

    if (isBullet || isLetterBullet) {
      // Flush any pending paragraph before starting list
      flushParagraph();
      
      // Remove bullet marker and add to list
      const content = trimmedLine.replace(/^[-*•]\s/, '').replace(/^\d+[.)]\s/, '').replace(/^[a-z][.)]\s/i, '');
      currentList.push(content);
    } else {
      // Regular text line
      // If we have a list, flush it first
      flushList();
      
      // Add to current paragraph
      currentParagraph.push(trimmedLine);
    }
  });

  // Flush any remaining content
  flushList();
  flushParagraph();

  // If no elements were created, return the original text
  if (elements.length === 0) {
    return <p>{text}</p>;
  }

  return <div className="space-y-1">{elements}</div>;
}

/**
 * Sanitizes bot response to detect and handle malformed/debug responses
 */
export function sanitizeBotResponse(response: string): string {
  // Check if response is empty
  if (!response || response.trim().length === 0) {
    return '';
  }

  // Check for obvious structured data patterns (JSON-like, debug dumps)
  // Be more conservative - only flag clear JSON structures
  const looksLikeJSON = 
    (response.startsWith('{') && response.endsWith('}')) ||
    (response.startsWith('[') && response.endsWith(']')) ||
    response.includes('{"') && response.includes('"}');

  if (looksLikeJSON) {
    return '';
  }

  // Return cleaned response
  return response.trim();
}
