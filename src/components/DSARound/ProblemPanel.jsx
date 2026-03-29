import React from "react";
import styles from "./DSARound.module.css";

const difficultyColor = {
  Easy: "#00b8a3",
  Medium: "#ffc01e",
  Hard: "#ff375f",
};

export default function ProblemPanel({ problem }) {
  return (
    <div className={styles.problemPanel}>
      {/* Header */}
      <div className={styles.problemHeader}>
        <h2 className={styles.problemTitle}>
          {problem.id}. {problem.title}
        </h2>
        <div className={styles.problemMeta}>
          <span
            className={styles.diffBadge}
            style={{ color: difficultyColor[problem.difficulty] }}
          >
            {problem.difficulty}
          </span>
          <span className={styles.categoryBadge}>{problem.category}</span>
        </div>
      </div>

      {/* Description */}
      <div className={styles.problemDescription}>
        {problem.description.split("\n").map((line, i) => {
          // Bold: **text**
          const parsed = line.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
          );
          // Inline code: `text`
          const parsed2 = parsed.replace(
            /`([^`]+)`/g,
            '<code class="inlineCode">$1</code>'
          );
          // Italic: *text*
          const parsed3 = parsed2.replace(/\*(.*?)\*/g, "<em>$1</em>");
          return (
            // eslint-disable-next-line react/no-danger
            <p
              key={i}
              dangerouslySetInnerHTML={{ __html: parsed3 }}
              className={styles.descPara}
            />
          );
        })}
      </div>

      {/* Examples */}
      <div className={styles.section}>
        {problem.examples.map((ex, i) => (
          <div key={i} className={styles.exampleBlock}>
            <p className={styles.exampleTitle}>
              <strong>Example {i + 1}:</strong>
            </p>
            <div className={styles.exampleBox}>
              <div className={styles.exampleRow}>
                <span className={styles.exKey}>Input:</span>
                <code>{ex.input}</code>
              </div>
              <div className={styles.exampleRow}>
                <span className={styles.exKey}>Output:</span>
                <code>{ex.output}</code>
              </div>
              {ex.explanation && (
                <div className={styles.exampleRow}>
                  <span className={styles.exKey}>Explanation:</span>
                  <span>{ex.explanation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>
          <strong>Constraints:</strong>
        </p>
        <ul className={styles.constraintList}>
          {problem.constraints.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
