import React, { useState, useRef } from 'react'

// Mock problems for demonstration
const mockProblems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6", 
        output: "[1,2]"
      }
    ],
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹", 
      "-10⁹ <= target <= 10⁹",
      "Only one valid answer exists."
    ],
    testCases: [
      { input: "[2,7,11,15], 9", expected: "[0,1]" },
      { input: "[3,2,4], 6", expected: "[1,2]" },
      { input: "[3,3], 6", expected: "[0,1]" }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Your code here
    
}`,
      python: `def two_sum(nums, target):
    # Your code here
    pass`
    }
  }
]

export default function DSACodeEditor() {
  const [selectedProblem] = useState(mockProblems[0])
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [code, setCode] = useState(selectedProblem.starterCode.javascript)
  const [testResults, setTestResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState('')
  const codeEditorRef = useRef(null)

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang)
    setCode(selectedProblem.starterCode[lang] || '')
    setTestResults([])
    setOutput('')
  }

  const runTests = () => {
    setIsRunning(true)
    setOutput('Running tests...')
    
    // Mock test execution
    setTimeout(() => {
      const mockResults = selectedProblem.testCases.map((testCase, index) => ({
        input: testCase.input,
        expected: testCase.expected,
        actual: index === 0 ? "[0,1]" : index === 1 ? "[1,2]" : "[0,1]", // Mock results
        passed: true,
        runtime: `${Math.floor(Math.random() * 100) + 20}ms`
      }))
      
      setTestResults(mockResults)
      setOutput(`✓ All ${mockResults.length} test cases passed!\\nRuntime: ${mockResults[0].runtime}\\nMemory: ${Math.floor(Math.random() * 20) + 10} MB`)
      setIsRunning(false)
    }, 1500)
  }

  const css = `
    .dsa-editor-wrapper {
      display: flex;
      height: 100vh;
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #f8f9fa;
    }

    .problem-panel {
      width: 45%;
      background: white;
      border-right: 1px solid #e1e5e9;
      overflow-y: auto;
      padding: 24px;
    }

    .code-panel {
      width: 55%;
      display: flex;
      flex-direction: column;
      background: #1e1e1e;
    }

    .problem-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #24344d;
      margin-bottom: 8px;
    }

    .problem-difficulty {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e6f4ea;
      color: #1e7e34;
      margin-bottom: 20px;
    }

    .problem-description {
      line-height: 1.6;
      color: #24344d;
      margin-bottom: 24px;
    }

    .problem-section {
      margin-bottom: 24px;
    }

    .section-title {
      font-weight: 700;
      color: #24344d;
      margin-bottom: 12px;
    }

    .example-box {
      background: #f8f9fa;
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.875rem;
    }

    .example-label {
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 4px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .constraint-list {
      list-style: none;
      padding: 0;
    }

    .constraint-list li {
      padding: 4px 0;
      color: #6b7280;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.875rem;
    }

    .code-header {
      background: #2d2d2d;
      padding: 12px 16px;
      border-bottom: 1px solid #404040;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .language-selector {
      display: flex;
      gap: 8px;
    }

    .language-btn {
      padding: 6px 12px;
      border: 1px solid #404040;
      background: #1e1e1e;
      color: #d4d4d4;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .language-btn.active {
      background: #007acc;
      border-color: #007acc;
      color: white;
    }

    .language-btn:hover:not(.active) {
      background: #333;
    }

    .code-editor {
      flex: 1;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 14px;
      padding: 16px;
      border: none;
      outline: none;
      resize: none;
      line-height: 1.5;
    }

    .code-footer {
      background: #2d2d2d;
      padding: 12px 16px;
      border-top: 1px solid #404040;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .run-btn {
      padding: 8px 16px;
      background: #007acc;
      border: none;
      border-radius: 4px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.2s;
    }

    .run-btn:hover:not(:disabled) {
      background: #005fa3;
    }

    .run-btn:disabled {
      background: #666;
      cursor: not-allowed;
    }

    .output-section {
      background: #f8f9fa;
      border-top: 1px solid #e1e5e9;
      max-height: 200px;
      overflow-y: auto;
    }

    .output-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e1e5e9;
      font-weight: 600;
      color: #24344d;
      background: white;
    }

    .output-content {
      padding: 16px;
    }

    .test-case {
      background: white;
      border: 1px solid #e1e5e9;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 8px;
    }

    .test-case.passed {
      border-left: 4px solid #22c55e;
    }

    .test-case.failed {
      border-left: 4px solid #ef4444;
    }

    .test-status {
      font-weight: 600;
      margin-bottom: 8px;
    }

    .test-status.passed {
      color: #16a34a;
    }

    .test-status.failed {
      color: #dc2626;
    }

    .test-details {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .output-text {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.875rem;
      color: #24344d;
      white-space: pre-line;
    }
  `

  return (
    <>
      <style>{css}</style>
      <div className="dsa-editor-wrapper">
        {/* Problem Panel */}
        <div className="problem-panel">
          <h1 className="problem-title">{selectedProblem.title}</h1>
          <span className="problem-difficulty">{selectedProblem.difficulty}</span>
          
          <div className="problem-description">
            {selectedProblem.description}
          </div>

          <div className="problem-section">
            <h3 className="section-title">Examples:</h3>
            {selectedProblem.examples.map((example, idx) => (
              <div key={idx} className="example-box">
                <div className="example-label">Example {idx + 1}:</div>
                <div><strong>Input:</strong> {example.input}</div>
                <div><strong>Output:</strong> {example.output}</div>
                {example.explanation && (
                  <div><strong>Explanation:</strong> {example.explanation}</div>
                )}
              </div>
            ))}
          </div>

          <div className="problem-section">
            <h3 className="section-title">Constraints:</h3>
            <ul className="constraint-list">
              {selectedProblem.constraints.map((constraint, idx) => (
                <li key={idx}>• {constraint}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Code Panel */}
        <div className="code-panel">
          <div className="code-header">
            <div className="language-selector">
              <button 
                className={`language-btn ${selectedLanguage === 'javascript' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('javascript')}
              >
                JavaScript
              </button>
              <button 
                className={`language-btn ${selectedLanguage === 'python' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('python')}
              >
                Python
              </button>
            </div>
          </div>

          <textarea
            ref={codeEditorRef}
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your solution here..."
            spellCheck="false"
          />

          <div className="code-footer">
            <button 
              className="run-btn"
              onClick={runTests}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Tests'}
            </button>
          </div>

          {/* Output Section */}
          {(testResults.length > 0 || output) && (
            <div className="output-section">
              <div className="output-header">Test Results</div>
              <div className="output-content">
                {testResults.length > 0 && (
                  <div>
                    {testResults.map((result, idx) => (
                      <div key={idx} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
                        <div className={`test-status ${result.passed ? 'passed' : 'failed'}`}>
                          {result.passed ? '✓' : '✗'} Test Case {idx + 1}
                        </div>
                        <div className="test-details">
                          <div><strong>Input:</strong> {result.input}</div>
                          <div><strong>Expected:</strong> {result.expected}</div>
                          <div><strong>Actual:</strong> {result.actual}</div>
                          {result.runtime && <div><strong>Runtime:</strong> {result.runtime}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {output && (
                  <div className="output-text">{output}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}