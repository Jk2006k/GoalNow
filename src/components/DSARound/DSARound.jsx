import React, { useState, useCallback } from "react";
import CodeEditor from "./CodeEditor";
import ProblemPanel from "./ProblemPanel";
import TestResultPanel from "./TestResultPanel";
import { problems } from "./problems";
import styles from "./DSARound.module.css";

const LANGUAGES = ["javascript", "python"];

function formatValue(val) {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  return JSON.stringify(val);
}

function formatInput(input) {
  return Object.entries(input)
    .map(([k, v]) => `${k} = ${formatValue(v)}`)
    .join(", ");
}

export default function DSARound() {
  const [selectedProblemId, setSelectedProblemId] = useState(problems[0].id);
  const [language, setLanguage] = useState("javascript");
  const [codes, setCodes] = useState(() => {
    const map = {};
    problems.forEach((p) => {
      map[p.id] = { ...p.starterCode };
    });
    return map;
  });
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("description"); // description | results

  const problem = problems.find((p) => p.id === selectedProblemId);
  const currentCode = codes[selectedProblemId]?.[language] ?? "";

  const handleCodeChange = useCallback(
    (newCode) => {
      setCodes((prev) => ({
        ...prev,
        [selectedProblemId]: {
          ...prev[selectedProblemId],
          [language]: newCode,
        },
      }));
    },
    [selectedProblemId, language]
  );

  const handleProblemChange = (id) => {
    setSelectedProblemId(id);
    setResults(null);
    setActiveTab("description");
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setResults(null);
  };

  const runCode = useCallback(async () => {
    if (language !== "javascript") {
      alert(
        "Mock execution is only available for JavaScript in this environment.\nPython syntax is shown for reference."
      );
      return;
    }

    setIsRunning(true);
    setActiveTab("results");
    setResults(null);

    // Simulate async execution delay
    await new Promise((r) => setTimeout(r, 600));

    const testResults = problem.testCases.map((tc) => {
      try {
        const output = problem.evaluator(currentCode, tc.input);
        const passed = problem.compareResults(output, tc.expected);
        return {
          passed,
          inputStr: formatInput(tc.input),
          expectedStr: formatValue(tc.expected),
          outputStr: formatValue(output),
          error: null,
        };
      } catch (e) {
        return {
          passed: false,
          inputStr: formatInput(tc.input),
          expectedStr: formatValue(tc.expected),
          outputStr: null,
          error: e.message,
        };
      }
    });

    setResults(testResults);
    setIsRunning(false);
  }, [problem, currentCode, language]);

  const resetCode = () => {
    setCodes((prev) => ({
      ...prev,
      [selectedProblemId]: {
        ...prev[selectedProblemId],
        [language]: problem.starterCode[language] ?? "",
      },
    }));
    setResults(null);
  };

  return (
    <div className={styles.root}>
      {/* ── Top Bar ── */}
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.logo}>⚡ DSA Round</span>
          <select
            className={styles.problemSelect}
            value={selectedProblemId}
            onChange={(e) => handleProblemChange(Number(e.target.value))}
            aria-label="Select problem"
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}. {p.title} ({p.difficulty})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.topRight}>
          <div className={styles.langToggle}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                className={`${styles.langBtn} ${language === lang ? styles.langActive : ""}`}
                onClick={() => handleLanguageChange(lang)}
              >
                {lang === "javascript" ? "JavaScript" : "Python"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className={styles.main}>
        {/* ── Left Pane: Problem + Results tabs ── */}
        <aside className={styles.leftPane}>
          <div className={styles.tabBar}>
            <button
              className={`${styles.tab} ${activeTab === "description" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`${styles.tab} ${activeTab === "results" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("results")}
            >
              Test Results
              {results && (
                <span className={styles.resultCount}>
                  {results.filter((r) => r.passed).length}/{results.length}
                </span>
              )}
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === "description" ? (
              <ProblemPanel problem={problem} />
            ) : (
              <TestResultPanel results={results} isRunning={isRunning} />
            )}
          </div>
        </aside>

        {/* ── Right Pane: Editor + IO ── */}
        <section className={styles.rightPane}>
          {/* Editor Header */}
          <div className={styles.editorHeader}>
            <div className={styles.editorTitle}>
              <span className={styles.fileIcon}>📄</span>
              <span>
                solution.{language === "javascript" ? "js" : "py"}
              </span>
            </div>
            <div className={styles.editorActions}>
              <button
                className={styles.resetBtn}
                onClick={resetCode}
                title="Reset to starter code"
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className={styles.editorContainer}>
            <CodeEditor
              value={currentCode}
              onChange={handleCodeChange}
              language={language}
            />
          </div>

          {/* IO Panel */}
          <div className={styles.ioPanel}>
            <div className={styles.ioHeader}>
              <span className={styles.ioTitle}>📋 Test Cases Preview</span>
              <span className={styles.ioCount}>
                {problem.testCases.length} cases
              </span>
            </div>
            <div className={styles.ioList}>
              {problem.testCases.map((tc, i) => (
                <div key={i} className={styles.ioItem}>
                  <span className={styles.ioLabel}>Case {i + 1}:</span>
                  <code className={styles.ioCode}>
                    {formatInput(tc.input)}
                  </code>
                  <span className={styles.ioArrow}>→</span>
                  <code className={styles.ioExpected}>
                    {formatValue(tc.expected)}
                  </code>
                </div>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <div className={styles.runBar}>
            <button
              className={styles.runBtn}
              onClick={runCode}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <span className={styles.spinner} /> Running…
                </>
              ) : (
                <>▶ Run Code</>
              )}
            </button>
            {language === "python" && (
              <span className={styles.pyNote}>
                ⚠ Python execution requires a backend. Switch to JavaScript for
                live testing.
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
