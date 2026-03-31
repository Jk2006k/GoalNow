/**
 * Code Submission Component - LeetCode Style
 * 
 * Features:
 * 1. "Run Code" - Tests visible test cases only (shows detailed results)
 * 2. "Submit Solution" - Tests visible + hidden test cases (shows only summary)
 * 
 * Ensures hidden test case data is NEVER displayed to the user
 */

import React, { useState } from 'react';
import axios from 'axios';

// Language options for the code editor
const LANGUAGES = {
  '71': { name: 'Python', ext: 'py' },
  '63': { name: 'JavaScript', ext: 'js' },
  '62': { name: 'Java', ext: 'java' },
  '54': { name: 'C++', ext: 'cpp' }
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CodeSubmission = ({ questionId, starterCode = '', functionName = 'solution' }) => {
  const [code, setCode] = useState(starterCode);
  const [selectedLanguage, setSelectedLanguage] = useState('71'); // Default to Python
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [actionType, setActionType] = useState(null); // 'run' or 'submit'

  /**
   * Run code against VISIBLE test cases only
   * Shows detailed results for debugging
   */
  const handleRunCode = async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setActionType('run');

    try {
      console.log('🏃 Running code against visible test cases...');
      
      const response = await axios.post(`${API_URL}/api/run`, {
        userCode: code,
        questionId: questionId,
        languageId: selectedLanguage,
        userId: localStorage.getItem('userId') || 'anonymous'
      });

      console.log('✅ Run complete:', response.data);
      setResults(response.data);
    } catch (err) {
      console.error('❌ Run failed:', err);
      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        'Evaluation failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit code for FULL evaluation (visible + hidden test cases)
   * Shows only summary results, no hidden test case details
   */
  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setActionType('submit');

    try {
      console.log('📤 Submitting code for full evaluation...');
      
      const response = await axios.post(`${API_URL}/api/submit`, {
        userCode: code,
        questionId: questionId,
        languageId: selectedLanguage,
        userId: localStorage.getItem('userId') || 'anonymous'
      });

      console.log('✅ Submission complete:', response.data);
      console.log('Submission data:', {
        submission: response.data.submission,
        totalTests: response.data.submission?.totalTests,
        passedTests: response.data.submission?.passedTests,
        hiddenTotal: response.data.submission?.hiddenTotal,
        hiddenPassed: response.data.submission?.hiddenPassed
      });
      setResults(response.data);
    } catch (err) {
      console.error('❌ Submission failed:', err);
      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        'Submission failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2>Code Submission</h2>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={styles.languageSelect}
          disabled={loading}
        >
          {Object.entries(LANGUAGES).map(([id, { name }]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Code Editor */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write your code here..."
        style={styles.codeEditor}
        disabled={loading}
      />

      {/* Action Buttons */}
      <div style={styles.buttonContainer}>
        <button
          onClick={handleRunCode}
          style={{ ...styles.button, ...styles.runButton }}
          disabled={loading}
          title="Test your code against visible test cases with detailed results"
        >
          {loading && actionType === 'run' ? '⏳ Running...' : '🏃 Run Code'}
        </button>
        <button
          onClick={handleSubmit}
          style={{ ...styles.button, ...styles.submitButton }}
          disabled={loading}
          title="Submit your solution for final evaluation (hidden test cases included)"
        >
          {loading && actionType === 'submit' ? '⏳ Submitting...' : '✅ Submit Solution'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox}>
          <strong>❌ Error:</strong>
          <pre>{error}</pre>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <ResultsDisplay 
          results={results} 
          language={selectedLanguage} 
          actionType={actionType}
        />
      )}
    </div>
  );
};

/**
 * Results Display Component
 * Shows different formats based on action type:
 * - Run Code: Detailed results with test case inputs/outputs
 * - Submit: Summary only (no hidden test case details)
 */
const ResultsDisplay = ({ results, language, actionType }) => {
  const isRunCode = actionType === 'run';
  const isSubmit = actionType === 'submit';
  const compilation = results.compilation || { success: true };

  // Extract data based on response format
  let testResults, submission, message;
  
  if (isRunCode) {
    testResults = results.testResults || {};
    message = results.message;
  } else if (isSubmit) {
    submission = results.submission || {};
    message = results.message;
  }

  const isCompileSuccess = compilation.success;

  return (
    <div style={styles.resultsContainer}>
      {/* Compilation Error */}
      {!isCompileSuccess && (
        <div style={styles.resultBox}>
          <div style={{ ...styles.resultHeader, ...styles.resultError }}>
            <h3 style={styles.resultTitle}>❌ Compilation Error</h3>
          </div>
          <div style={styles.resultContent}>
            <pre style={styles.errorMessage}>{compilation.error}</pre>
          </div>
        </div>
      )}

      {/* Run Code Results */}
      {isCompileSuccess && isRunCode && (
        <>
          <div style={styles.resultBox}>
            <div style={{
              ...styles.resultHeader,
              ...(testResults.passed === testResults.total ? styles.resultSuccess : styles.resultFail)
            }}>
              <h3 style={styles.resultTitle}>
                {testResults.passed === testResults.total ? '✅ All Tests Passed!' : '⚠️ Some Tests Failed'}
              </h3>
              <div style={styles.resultStats}>
                <span>{testResults.passed}/{testResults.total} test cases passed</span>
              </div>
            </div>
          </div>

          {/* Test Case Details */}
          {testResults.details && testResults.details.length > 0 && (
            <div style={styles.testCasesContainer}>
              <h4 style={styles.testCasesTitle}>📋 Test Case Details</h4>
              <div style={styles.testCasesList}>
                {testResults.details.map((testCase, index) => (
                  <TestCaseResult 
                    key={index} 
                    testCase={testCase} 
                    index={index}
                    isHidden={false}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Submit Results */}
      {isCompileSuccess && isSubmit && (
        <>
          {submission && submission.totalTests ? (
            <>
              <div style={styles.resultBox}>
                <div style={{
                  ...styles.resultHeader,
                  ...(submission.passedTests === submission.totalTests ? styles.resultSuccess : styles.resultFail)
                }}>
                  <h3 style={styles.resultTitle}>
                    {submission.passedTests === submission.totalTests ? '✅ Accepted!' : '❌ Failed'}
                  </h3>
                  <div style={styles.submissionStats}>
                    <div style={styles.statRow}>
                      <span style={styles.statLabel}>Total Tests:</span>
                      <span style={styles.statValue}>{submission.totalTests || 0}</span>
                    </div>
                    <div style={styles.statRow}>
                      <span style={styles.statLabel}>Passed:</span>
                      <span style={{ ...styles.statValue, color: '#388e3c' }}>
                        {submission.passedTests || 0}
                      </span>
                    </div>
                    <div style={styles.statRow}>
                      <span style={styles.statLabel}>Failed:</span>
                      <span style={{ ...styles.statValue, color: '#d32f2f' }}>
                        {submission.failedTests || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visible Test Details (if any failed) */}
              {results.visibleTestDetails && results.visibleTestDetails.length > 0 && (
                <div style={styles.testCasesContainer}>
                  <h4 style={styles.testCasesTitle}>📋 Failing Visible Test Cases</h4>
                  <p style={styles.testCasesSubtitle}>
                    These visible test cases failed. Review them to debug your solution.
                  </p>
                  <div style={styles.testCasesList}>
                    {results.visibleTestDetails
                      .filter(tc => !tc.passed)
                      .map((testCase, index) => (
                      <TestCaseResult 
                        key={index} 
                        testCase={testCase} 
                        index={index}
                        isHidden={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden Tests Summary - Only show if there are hidden tests */}
              {submission.hiddenTotal && submission.hiddenTotal > 0 && (
                <div style={styles.hiddenTestsBox}>
                  <div style={styles.hiddenTestsContent}>
                    <span style={styles.hiddenTestsIcon}>🔒</span>
                    <div style={styles.hiddenTestsText}>
                      <strong>Hidden Test Cases: {submission.hiddenPassed}/{submission.hiddenTotal} passed</strong>
                      <div style={styles.hiddenTestsList}>
                        {Array.from({ length: submission.hiddenTotal }, (_, i) => {
                          const caseNum = i + 1;
                          const isPassed = caseNum <= submission.hiddenPassed;
                          return (
                            <div key={i} style={styles.hiddenTestItem}>
                              <span style={isPassed ? { color: '#388e3c' } : { color: '#d32f2f' }}>
                                {isPassed ? '✅' : '❌'} Case {submission.visibleTotal + caseNum}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p style={styles.hiddenTestsNote}>
                        Hidden test case details are not shown for security reasons.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={styles.resultBox}>
              <div style={{ ...styles.resultHeader, backgroundColor: '#fff3e0' }}>
                <h3 style={styles.resultTitle}>⏳ Processing Submission...</h3>
                <p style={{ color: '#666', margin: '8px 0 0 0' }}>
                  No test results received. Please check the browser console for errors.
                </p>
                {results && (
                  <pre style={{ 
                    margin: '8px 0 0 0', 
                    padding: '8px', 
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '11px',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(results, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Message */}
      {message && (
        <div style={styles.messageBox}>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Individual Test Case Result Component
 */
const TestCaseResult = ({ testCase, index, isHidden }) => {
  const [expanded, setExpanded] = useState(false);

  const statusColor = testCase.passed ? '#388e3c' : '#d32f2f';
  const statusIcon = testCase.passed ? '✅' : '❌';

  return (
    <div style={styles.testCaseCard}>
      {/* Header */}
      <div
        style={{ ...styles.testCaseHeader, borderLeftColor: statusColor }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ flex: 1 }}>
          <strong>{statusIcon} Test Case {index + 1}</strong>
          {isHidden && <span style={styles.hiddenBadge}>🔒 Hidden</span>}
        </span>
        <span style={{ cursor: 'pointer', fontSize: '12px' }}>
          {expanded ? '▼' : '▶'}
        </span>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={styles.testCaseContent}>
          {/* Input */}
          <div style={styles.testCaseField}>
            <strong>Input:</strong>
            <pre style={styles.testCaseValue}>{testCase.input}</pre>
          </div>

          {/* Expected Output */}
          <div style={styles.testCaseField}>
            <strong>Expected Output:</strong>
            <pre style={styles.testCaseValue}>{testCase.expected}</pre>
          </div>

          {/* Actual Output */}
          {testCase.actual && (
            <div style={styles.testCaseField}>
              <strong>Actual Output:</strong>
              <pre style={{ ...styles.testCaseValue, color: testCase.passed ? '#388e3c' : '#d32f2f' }}>
                {testCase.actual}
              </pre>
            </div>
          )}

          {/* Error Message */}
          {testCase.error && (
            <div style={styles.testCaseField}>
              <strong style={{ color: '#d32f2f' }}>Error:</strong>
              <pre style={{ ...styles.testCaseValue, color: '#d32f2f' }}>
                {testCase.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== STYLES ====================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  languageSelect: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  codeEditor: {
    padding: '12px',
    fontSize: '14px',
    fontFamily: 'monospace',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minHeight: '300px',
    resize: 'vertical',
    backgroundColor: '#fafafa',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  runButton: {
    backgroundColor: '#2196F3',
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#388e3c',
    color: 'white',
  },
  errorBox: {
    padding: '16px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
    borderLeft: '4px solid #d32f2f',
    color: '#c62828',
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  errorMessage: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  resultBox: {
    backgroundColor: 'white',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  resultHeader: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultSuccess: {
    backgroundColor: '#e8f5e9',
    borderLeft: '4px solid #388e3c',
  },
  resultFail: {
    backgroundColor: '#ffebee',
    borderLeft: '4px solid #d32f2f',
  },
  resultError: {
    backgroundColor: '#ffebee',
    borderLeft: '4px solid #d32f2f',
  },
  resultTitle: {
    margin: '0 0 8px 0',
    color: '#333',
    fontSize: '18px',
  },
  resultStats: {
    fontSize: '14px',
    color: '#666',
  },
  resultContent: {
    padding: '16px',
    borderTop: '1px solid #eee',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  submissionStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  statLabel: {
    color: '#666',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  testCasesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  testCasesTitle: {
    margin: '0 0 4px 0',
    color: '#333',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  testCasesSubtitle: {
    margin: '0 0 12px 0',
    color: '#666',
    fontSize: '12px',
  },
  testCasesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  testCaseCard: {
    backgroundColor: 'white',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  testCaseHeader: {
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderLeft: '4px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: '14px',
  },
  hiddenBadge: {
    marginLeft: '8px',
    fontSize: '11px',
    backgroundColor: '#f3e5f5',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  testCaseContent: {
    padding: '12px',
    borderTop: '1px solid #eee',
  },
  testCaseField: {
    marginBottom: '12px',
  },
  testCaseValue: {
    backgroundColor: '#f5f5f5',
    padding: '8px',
    borderRadius: '4px',
    boxSizing: 'border-box',
    wordBreak: 'break-word',
    margin: '8px 0 0 0',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  hiddenTestsBox: {
    backgroundColor: '#f3e5f5',
    border: '1px solid #ce93d8',
    borderRadius: '4px',
    padding: '16px',
  },
  hiddenTestsContent: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  hiddenTestsIcon: {
    fontSize: '24px',
  },
  hiddenTestsText: {
    fontSize: '14px',
    color: '#4a148c',
  },
  hiddenTestsNote: {
    margin: '8px 0 0 0',
    fontSize: '12px',
    color: '#6a1b9a',
    fontStyle: 'italic',
  },
  hiddenTestsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    margin: '8px 0 0 0',
    paddingLeft: '8px',
    borderLeft: '2px solid #ce93d8',
  },
  hiddenTestItem: {
    fontSize: '13px',
    fontWeight: '500',
  },
  textSuccess: {
    color: '#388e3c',
  },
  textError: {
    color: '#d32f2f',
  },
  messageBox: {
    padding: '12px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    borderLeft: '4px solid #2196F3',
    fontSize: '14px',
    color: '#1565c0',
  },
};

export default CodeSubmission;
