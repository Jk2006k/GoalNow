import React from "react";
import styles from "./DSARound.module.css";

export default function TestResultPanel({ results, isRunning }) {
  if (isRunning) {
    return (
      <div className={styles.resultsPanel}>
        <div className={styles.runningMsg}>
          <span className={styles.spinner} /> Running test cases…
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={styles.resultsPanel}>
        <p className={styles.hint}>
          Click <strong>Run Code</strong> to execute your solution against the
          test cases.
        </p>
      </div>
    );
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const allPassed = passed === total;

  return (
    <div className={styles.resultsPanel}>
      <div className={`${styles.summary} ${allPassed ? styles.allPass : styles.someFail}`}>
        {allPassed ? "✅" : "❌"}{" "}
        <strong>
          {passed}/{total} test cases passed
        </strong>
      </div>

      <div className={styles.caseList}>
        {results.map((r, idx) => (
          <div
            key={idx}
            className={`${styles.caseCard} ${r.passed ? styles.casePass : styles.caseFail}`}
          >
            <div className={styles.caseHeader}>
              <span className={styles.caseBadge}>
                {r.passed ? "✓ Passed" : "✗ Failed"}
              </span>
              <span className={styles.caseLabel}>Case {idx + 1}</span>
            </div>

            <div className={styles.caseBody}>
              <div className={styles.caseRow}>
                <span className={styles.caseKey}>Input:</span>
                <code className={styles.caseVal}>{r.inputStr}</code>
              </div>
              <div className={styles.caseRow}>
                <span className={styles.caseKey}>Expected:</span>
                <code className={styles.caseVal}>{r.expectedStr}</code>
              </div>
              <div className={styles.caseRow}>
                <span className={styles.caseKey}>Output:</span>
                <code
                  className={`${styles.caseVal} ${
                    r.passed ? styles.outputPass : styles.outputFail
                  }`}
                >
                  {r.error ? `Error: ${r.error}` : r.outputStr}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
