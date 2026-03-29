import React, { useRef, useEffect, useCallback } from "react";
import styles from "./DSARound.module.css";

// Keyword maps for lightweight syntax highlighting (no external deps)
const JS_KEYWORDS = /\b(function|return|const|let|var|if|else|for|while|do|break|continue|new|typeof|instanceof|null|undefined|true|false|class|extends|import|export|default|throw|try|catch|finally|of|in|switch|case|this|=>)\b/g;
const PY_KEYWORDS = /\b(def|return|if|elif|else|for|while|break|continue|pass|import|from|as|class|try|except|finally|raise|with|lambda|and|or|not|in|is|None|True|False|global|nonlocal|yield|async|await)\b/g;

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlight(code, lang) {
  let escaped = escapeHtml(code);

  // Strings
  escaped = escaped.replace(
    /(&#39;&#39;&#39;[\s\S]*?&#39;&#39;&#39;|"""[\s\S]*?"""|`[^`]*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
    '<span class="hl-string">$1</span>'
  );

  // Comments
  if (lang === "python") {
    escaped = escaped.replace(/(#.*)/g, '<span class="hl-comment">$1</span>');
  } else {
    escaped = escaped.replace(
      /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
      '<span class="hl-comment">$1</span>'
    );
  }

  // Numbers
  escaped = escaped.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span class="hl-number">$1</span>'
  );

  // Keywords
  const kwRegex = lang === "python" ? PY_KEYWORDS : JS_KEYWORDS;
  escaped = escaped.replace(
    kwRegex,
    '<span class="hl-keyword">$1</span>'
  );

  return escaped;
}

const TAB = "  "; // 2-space indent

export default function CodeEditor({ value, onChange, language }) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);

  const syncScroll = useCallback(() => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.innerHTML =
        highlight(value, language) + "\n"; // trailing newline prevents last-line clipping
    }
  }, [value, language]);

  const handleKeyDown = useCallback(
    (e) => {
      const { selectionStart, selectionEnd } = e.target;

      if (e.key === "Tab") {
        e.preventDefault();
        const before = value.slice(0, selectionStart);
        const after = value.slice(selectionEnd);
        const newVal = before + TAB + after;
        onChange(newVal);
        // Restore cursor after React re-render
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart =
              textareaRef.current.selectionEnd =
                selectionStart + TAB.length;
          }
        });
      }

      // Auto-close brackets / quotes
      const pairs = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'" };
      if (pairs[e.key] && selectionStart === selectionEnd) {
        e.preventDefault();
        const before = value.slice(0, selectionStart);
        const after = value.slice(selectionEnd);
        const newVal = before + e.key + pairs[e.key] + after;
        onChange(newVal);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart =
              textareaRef.current.selectionEnd = selectionStart + 1;
          }
        });
      }
    },
    [value, onChange]
  );

  return (
    <div className={styles.editorWrapper}>
      <pre
        ref={highlightRef}
        className={styles.highlight}
        aria-hidden="true"
      />
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        aria-label="Code editor"
      />
    </div>
  );
}
