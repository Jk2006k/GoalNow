import React, { useMemo, useState } from "react"
import HomePageNavbar from "../components/HomePageNavbar"

const PROBLEM = {
  title: "Two Sum",
  difficulty: "Easy",
  description:
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Assume exactly one solution exists, and you may not use the same element twice.",
  input: "nums = [2, 7, 11, 15], target = 9",
  output: "[0, 1]",
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists."
  ]
}

const STARTER_CODE = {
  javascript: `function twoSum(nums, target) {\n  // Write your solution here\n  const seen = new Map();\n\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n\n    if (seen.has(complement)) {\n      return [seen.get(complement), i];\n    }\n\n    seen.set(nums[i], i);\n  }\n\n  return [];\n}`,
  python: `def two_sum(nums, target):\n    # Write your solution here\n    seen = {}\n\n    for index, value in enumerate(nums):\n        complement = target - value\n\n        if complement in seen:\n            return [seen[complement], index]\n\n        seen[value] = index\n\n    return []`
}

const TEST_CASES = [
  {
    id: 1,
    input: "nums = [2, 7, 11, 15], target = 9",
    expected: "[0, 1]"
  },
  {
    id: 2,
    input: "nums = [3, 2, 4], target = 6",
    expected: "[1, 2]"
  },
  {
    id: 3,
    input: "nums = [3, 3], target = 6",
    expected: "[0, 1]"
  }
]

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function highlightCode(code, language) {
  const keywords =
    language === "python"
      ? /\b(def|return|for|in|if|enumerate|True|False|None)\b/g
      : /\b(function|return|const|let|for|if|new)\b/g

  return escapeHtml(code)
    .replace(/(\/\/.*$|#.*$)/gm, '<span class="token comment">$1</span>')
    .replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, '<span class="token string">$&</span>')
    .replace(/\b(\d+)\b/g, '<span class="token number">$1</span>')
    .replace(keywords, '<span class="token keyword">$1</span>')
}

export default function DSAInterview() {
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState(STARTER_CODE.javascript)
  const [customInput, setCustomInput] = useState(PROBLEM.input)
  const [selectedCase, setSelectedCase] = useState(TEST_CASES[0].id)
  const [results, setResults] = useState([])
  const [hasRun, setHasRun] = useState(false)

  const highlightedCode = useMemo(() => highlightCode(code, language), [code, language])

  function handleLanguageChange(nextLanguage) {
    setLanguage(nextLanguage)
    setCode(STARTER_CODE[nextLanguage])
    setResults([])
    setHasRun(false)
  }

  function handleRun() {
    const generated = TEST_CASES.map((testCase, index) => ({
      ...testCase,
      status: index < 2 ? "Passed" : "Failed",
      output: index < 2 ? testCase.expected : "[1, 0]",
      runtime: `${12 + index * 5} ms`
    }))

    setResults(generated)
    setHasRun(true)
    setSelectedCase(generated[generated.length - 1].id)
  }

  const selectedResult = (hasRun ? results : TEST_CASES).find((item) => item.id === selectedCase)

  const css = `
    * { box-sizing: border-box; }
    body { margin: 0; background: #0f172a; }

    .dsa-shell {
      min-height: 100vh;
      background: linear-gradient(180deg, #0b1220 0%, #111827 100%);
      color: #e5e7eb;
      font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
      padding-top: 84px;
    }

    .dsa-layout {
      display: grid;
      grid-template-columns: 380px 1fr 320px;
      gap: 16px;
      padding: 20px;
      min-height: calc(100vh - 84px);
    }

    .panel {
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.16);
      border-radius: 18px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .panel-header {
      padding: 18px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .panel-title {
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.01em;
      color: #f8fafc;
    }

    .badge {
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(56, 189, 248, 0.12);
      color: #7dd3fc;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .problem-body, .test-body {
      padding: 20px;
      overflow-y: auto;
    }

    .problem-heading {
      font-size: 1.45rem;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 6px;
    }

    .meta-row {
      display: flex;
      gap: 10px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }

    .meta-pill {
      border-radius: 999px;
      padding: 5px 10px;
      font-size: 0.74rem;
      font-weight: 700;
      background: rgba(148, 163, 184, 0.12);
      color: #cbd5e1;
    }

    .meta-pill.easy {
      background: rgba(34, 197, 94, 0.14);
      color: #86efac;
    }

    .section {
      margin-bottom: 22px;
    }

    .section h3 {
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin-bottom: 10px;
    }

    .section p, .section li {
      color: #dbe4f0;
      line-height: 1.7;
      font-size: 0.92rem;
    }

    .io-box {
      padding: 12px 14px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(148, 163, 184, 0.12);
      border-radius: 12px;
      margin-bottom: 10px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.85rem;
      color: #e2e8f0;
    }

    .editor-shell {
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .editor-toolbar {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .lang-switch {
      display: flex;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.12);
      border-radius: 12px;
      padding: 4px;
      gap: 4px;
    }

    .lang-btn {
      border: none;
      background: transparent;
      color: #cbd5e1;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
    }

    .lang-btn.active {
      background: #2563eb;
      color: white;
    }

    .run-btn {
      border: none;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      border-radius: 12px;
      padding: 10px 18px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 12px 24px rgba(34, 197, 94, 0.18);
    }

    .editor-wrap {
      position: relative;
      flex: 1;
      min-height: 380px;
      background: #020617;
      overflow: auto;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    .code-layer,
    .code-input {
      margin: 0;
      padding: 22px;
      min-height: 100%;
      font-size: 0.88rem;
      line-height: 1.65;
      white-space: pre;
      tab-size: 2;
    }

    .code-layer {
      pointer-events: none;
      color: #e2e8f0;
    }

    .code-input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      resize: none;
      border: none;
      outline: none;
      background: transparent;
      color: transparent;
      caret-color: #f8fafc;
      overflow: auto;
    }

    .token.keyword { color: #c084fc; }
    .token.string { color: #86efac; }
    .token.number { color: #fca5a5; }
    .token.comment { color: #64748b; }

    .io-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      padding: 16px 18px 18px;
      border-top: 1px solid rgba(148, 163, 184, 0.12);
      background: rgba(15, 23, 42, 0.88);
    }

    .io-panel {
      background: rgba(2, 6, 23, 0.95);
      border: 1px solid rgba(148, 163, 184, 0.12);
      border-radius: 14px;
      padding: 14px;
    }

    .io-panel h4 {
      margin: 0 0 8px;
      color: #cbd5e1;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .io-panel textarea, .io-panel pre {
      width: 100%;
      min-height: 100px;
      margin: 0;
      border: none;
      resize: none;
      outline: none;
      background: transparent;
      color: #e2e8f0;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.84rem;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .case-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 18px;
    }

    .case-btn {
      border: 1px solid rgba(148, 163, 184, 0.12);
      background: rgba(15, 23, 42, 0.72);
      color: #dbe4f0;
      border-radius: 14px;
      padding: 14px;
      text-align: left;
      cursor: pointer;
    }

    .case-btn.active {
      border-color: rgba(59, 130, 246, 0.9);
      background: rgba(37, 99, 235, 0.12);
    }

    .case-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.88rem;
      font-weight: 700;
      margin-bottom: 8px;
      gap: 10px;
    }

    .status {
      padding: 4px 8px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 800;
    }

    .status.pending {
      background: rgba(148, 163, 184, 0.12);
      color: #cbd5e1;
    }

    .status.Passed {
      background: rgba(34, 197, 94, 0.14);
      color: #86efac;
    }

    .status.Failed {
      background: rgba(239, 68, 68, 0.14);
      color: #fca5a5;
    }

    .detail-card {
      border-top: 1px solid rgba(148, 163, 184, 0.12);
      padding-top: 16px;
    }

    .detail-title {
      font-size: 0.88rem;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 10px;
    }

    .detail-box {
      background: rgba(2, 6, 23, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.12);
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 10px;
      font-size: 0.83rem;
      line-height: 1.65;
      color: #dbe4f0;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      white-space: pre-wrap;
    }

    @media (max-width: 1280px) {
      .dsa-layout {
        grid-template-columns: 340px 1fr;
      }
      .test-panel {
        grid-column: 1 / -1;
        min-height: 320px;
      }
    }

    @media (max-width: 900px) {
      .dsa-layout {
        grid-template-columns: 1fr;
      }
      .io-grid {
        grid-template-columns: 1fr;
      }
    }
  `

  return (
    <div className="dsa-shell">
      <style>{css}</style>
      <HomePageNavbar />

      <div className="dsa-layout">
        <section className="panel">
          <div className="panel-header">
            <span className="panel-title">Problem</span>
            <span className="badge">DSA Round</span>
          </div>

          <div className="problem-body">
            <div className="problem-heading">{PROBLEM.title}</div>
            <div className="meta-row">
              <span className="meta-pill easy">{PROBLEM.difficulty}</span>
              <span className="meta-pill">Array</span>
              <span className="meta-pill">Hash Map</span>
            </div>

            <div className="section">
              <h3>Description</h3>
              <p>{PROBLEM.description}</p>
            </div>

            <div className="section">
              <h3>Input</h3>
              <div className="io-box">{PROBLEM.input}</div>
            </div>

            <div className="section">
              <h3>Output</h3>
              <div className="io-box">{PROBLEM.output}</div>
            </div>

            <div className="section">
              <h3>Constraints</h3>
              <ul>
                {PROBLEM.constraints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="panel editor-shell">
          <div className="editor-toolbar">
            <div className="lang-switch">
              <button
                className={`lang-btn ${language === "javascript" ? "active" : ""}`}
                onClick={() => handleLanguageChange("javascript")}
              >
                JavaScript
              </button>
              <button
                className={`lang-btn ${language === "python" ? "active" : ""}`}
                onClick={() => handleLanguageChange("python")}
              >
                Python
              </button>
            </div>

            <button className="run-btn" onClick={handleRun}>Run</button>
          </div>

          <div className="editor-wrap">
            <pre className="code-layer" aria-hidden="true">
              <code dangerouslySetInnerHTML={{ __html: highlightedCode + "\n" }} />
            </pre>
            <textarea
              className="code-input"
              spellCheck="false"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              aria-label="Code editor"
            />
          </div>

          <div className="io-grid">
            <div className="io-panel">
              <h4>Input</h4>
              <textarea
                value={customInput}
                onChange={(event) => setCustomInput(event.target.value)}
                aria-label="Custom input"
              />
            </div>
            <div className="io-panel">
              <h4>Output</h4>
              <pre>{hasRun ? "Executed against predefined test cases using mock evaluation.\nSee results panel for pass/fail status." : "Run your code to see output here."}</pre>
            </div>
          </div>
        </section>

        <aside className="panel test-panel">
          <div className="panel-header">
            <span className="panel-title">Test Cases</span>
            <span className="badge">{hasRun ? "Results Ready" : "Predefined"}</span>
          </div>

          <div className="test-body">
            <div className="case-list">
              {(hasRun ? results : TEST_CASES).map((testCase) => {
                const status = hasRun ? testCase.status : "pending"
                return (
                  <button
                    key={testCase.id}
                    className={`case-btn ${selectedCase === testCase.id ? "active" : ""}`}
                    onClick={() => setSelectedCase(testCase.id)}
                  >
                    <div className="case-label">
                      <span>Case {testCase.id}</span>
                      <span className={`status ${status}`}>{hasRun ? status : "Pending"}</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{testCase.input}</div>
                  </button>
                )
              })}
            </div>

            {selectedResult && (
              <div className="detail-card">
                <div className="detail-title">Selected Case Details</div>
                <div className="detail-box">Input: {selectedResult.input}</div>
                <div className="detail-box">Expected: {selectedResult.expected}</div>
                {hasRun && (
                  <>
                    <div className="detail-box">Output: {selectedResult.output}</div>
                    <div className="detail-box">Runtime: {selectedResult.runtime}</div>
                  </>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
