import type React from "react";

export function formatChatbotResponse(text: string): React.ReactNode {
  if (!text || text.trim().length === 0) {
    return "I'm sorry, I couldn't generate a proper response. Please try asking again or visit the Doctors page to browse available specialists.";
  }

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-2">
          {currentParagraph.join(" ")}
        </p>,
      );
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="list-disc list-inside mb-2 space-y-1"
        >
          {currentList.map((item) => (
            <li key={item} className="ml-2">
              {item}
            </li>
          ))}
        </ul>,
      );
      currentList = [];
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0) {
      flushList();
      flushParagraph();
      continue;
    }

    const isBullet =
      /^[-*•]\s/.test(trimmedLine) || /^\d+[.)]\s/.test(trimmedLine);
    const isLetterBullet = /^[a-z][.)]\s/i.test(trimmedLine);

    if (isBullet || isLetterBullet) {
      flushParagraph();
      const content = trimmedLine
        .replace(/^[-*•]\s/, "")
        .replace(/^\d+[.)]\s/, "")
        .replace(/^[a-z][.)]\s/i, "");
      currentList.push(content);
    } else {
      flushList();
      currentParagraph.push(trimmedLine);
    }
  }

  flushList();
  flushParagraph();

  if (elements.length === 0) {
    return <p>{text}</p>;
  }

  return <div className="space-y-1">{elements}</div>;
}

export function sanitizeBotResponse(response: string): string {
  if (!response || response.trim().length === 0) {
    return "";
  }

  const looksLikeJSON =
    (response.startsWith("{") && response.endsWith("}")) ||
    (response.startsWith("[") && response.endsWith("]")) ||
    (response.includes('{"') && response.includes('"}'));

  if (looksLikeJSON) {
    return "";
  }

  return response.trim();
}

export function sanitizeErrorDetail(error: unknown): string {
  let message = "";

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String((error as { message: unknown }).message);
  } else {
    message = String(error);
  }

  message = message.replace(/<[^>]*>/g, "");
  message = message.replace(/\s+/g, " ").trim();

  if (message.length > 200) {
    message = `${message.substring(0, 197)}...`;
  }

  return message;
}

export function isUnauthorizedError(error: unknown): boolean {
  const errorDetail = sanitizeErrorDetail(error);
  return errorDetail.toLowerCase().includes("unauthorized");
}

export function isTimeoutError(error: unknown): boolean {
  const errorDetail = sanitizeErrorDetail(error);
  const lowerDetail = errorDetail.toLowerCase();
  return lowerDetail.includes("timeout") || lowerDetail.includes("timed out");
}
