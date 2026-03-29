/**
 * DSARound.jsx
 *
 * LeetCode-style coding interface for the DSA interview round.
 * Users can:
 *   - Browse predefined DSA problems
 *   - Read the problem description, examples, and constraints
 *   - Write JavaScript solutions in an editable code area
 *   - Run their code against test cases and see pass/fail results
 */

import React, { useState, useCallback } from "react";
import problems from "./problems";
import { runCode } from "./codeRunner";
import "./DSARound.css";

// Difficulty badge colours
const DIFFICULTY_COLOURS = {
  Easy: "#00b8a3",
  Medium: "#ffc01e",
  Hard: "#ff375f",
};

export default function DSARound() {
  const [selectedProblem, setSelectedProblem] = useState(problems[0]);
  const [code, setCode] = useState(problems[0].starterCode);
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Switch problem — reset editor and results
  const handleSelectProblem = useCallback(
    (problem) => {
      setSelectedProblem(problem);
      setCode(problem.starterCode);
      setRunResult(null);
    },
    []
  );

  // Execute user code against the problem's test cases
  const handleRun = useCallback(() => {
    setIsRunning(true);
    setRunResult(null);

    // Yield to the browser so the loading state renders before the (synchronous) eval
    setTimeout(() => {
      const result = runCode(code, selectedProblem);
      setRunResult(result);
      setIsRunning(false);
    }, 0);
  }, [code, selectedProblem]);

  // Reset editor to starter code
  const handleReset = useCallback(() => {
    setCode(selectedProblem.starterCode);
    setRunResult(null);
  }, [selectedProblem]);

  return (
    <div className="dsa-round">
      {/* ── Sidebar: problem list ── */}
      <aside className="dsa-sidebar">
        <h2 className="dsa-sidebar__title">Problems</h2>
        <ul className="dsa-problem-list">
          {problems.map((p) => (
            <li
              key={p.id}
              className={`dsa-problem-list__item${
                p.id === selectedProblem.id
                  ? " dsa-problem-list__item--active"
                  : ""
              }`}
              onClick={() => handleSelectProblem(p)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && handleSelectProblem(p)
              }
            >
              <span className="dsa-problem-list__id">{p.id}.</span>
              <span className="dsa-problem-list__name">{p.title}</span>
              <span
                className="dsa-problem-list__difficulty"
                style={{ color: DIFFICULTY_COLOURS[p.difficulty] }}
              >
                {p.difficulty}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      {/* ── Main panel ── */}
      <main className="dsa-main">
        {/* Problem description panel */}
        <section className="dsa-description">
          <header className="dsa-description__header">
            <h1 className="dsa-description__title">
              {selectedProblem.id}. {selectedProblem.title}
            </h1>
            <span
              className="dsa-description__badge"
              style={{
                backgroundColor:
                  DIFFICULTY_COLOURS[selectedProblem.difficulty],
              }}
            >
              {selectedProblem.difficulty}
            </span>
          </header>

          <p className="dsa-description__body">{selectedProblem.description}</p>

          {selectedProblem.examples.map((ex, i) => (
            <div key={i} className="dsa-example">
              <strong>Example {i + 1}:</strong>
              <pre className="dsa-example__block">
                <span>Input: {ex.input}</span>
                {"\n"}
                <span>Output: {ex.output}</span>
                {ex.explanation && (
                  <>
                    {"\n"}
                    <span>Explanation: {ex.explanation}</span>
                  </>
                )}
              </pre>
            </div>
          ))}

          <div className="dsa-constraints">
            <strong>Constraints:</strong>
            <ul>
              {selectedProblem.constraints.map((c, i) => (
                <li key={i}>
                  <code>{c}</code>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Code editor + controls */}
        <section className="dsa-editor-section">
          <div className="dsa-editor-toolbar">
            <span className="dsa-editor-toolbar__lang">JavaScript</span>
            <div className="dsa-editor-toolbar__actions">
              <button
                className="dsa-btn dsa-btn--secondary"
                onClick={handleReset}
              >
                Reset
              </button>
              <button
                className="dsa-btn dsa-btn--primary"
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? "Running…" : "Run Code"}
              </button>
            </div>
          </div>

          <textarea
            className="dsa-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            aria-label="Code editor"
          />
        </section>

        {/* Test results */}
        {runResult && (
          <section className="dsa-results">
            {runResult.error && !runResult.results.length ? (
              <div className="dsa-results__global-error">
                <strong>Error:</strong> {runResult.error}
              </div>
            ) : (
              <>
                <div className="dsa-results__summary">
                  {runResult.passed === runResult.total ? (
                    <span className="dsa-results__summary--pass">
                      ✅ All {runResult.total} test cases passed!
                    </span>
                  ) : (
                    <span className="dsa-results__summary--fail">
                      ❌ {runResult.passed} / {runResult.total} test cases
                      passed
                    </span>
                  )}
                </div>

                <div className="dsa-test-cases">
                  {runResult.results.map((r) => (
                    <div
                      key={r.testCase}
                      className={`dsa-test-case${
                        r.passed
                          ? " dsa-test-case--pass"
                          : " dsa-test-case--fail"
                      }`}
                    >
                      <div className="dsa-test-case__header">
                        <span>
                          {r.passed ? "✅" : "❌"} Test Case {r.testCase}
                        </span>
                      </div>
                      <div className="dsa-test-case__body">
                        <div>
                          <span className="dsa-test-case__label">Input:</span>{" "}
                          <code>{JSON.stringify(r.input)}</code>
                        </div>
                        <div>
                          <span className="dsa-test-case__label">
                            Expected:
                          </span>{" "}
                          <code>{JSON.stringify(r.expected)}</code>
                        </div>
                        {!r.passed && (
                          <div>
                            <span className="dsa-test-case__label">
                              Your output:
                            </span>{" "}
                            <code>
                              {r.error
                                ? `Error: ${r.error}`
                                : JSON.stringify(r.result)}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
