/**
 * Example: Integrating Evaluation Engine into DSAInterview Page
 * 
 * This shows how to use the evaluation engine in your existing
 * DSA interview page with code editor and test results.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CodeSubmission from '../components/CodeSubmission';
import useCodeEvaluation from '../hooks/useCodeEvaluation';

const DSAInterviewWithEvaluation = ({ questionId }) => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const { submitCode, results, loading: evalLoading, error } = useCodeEvaluation();

  // Fetch question on mount
  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`https://goalnow.onrender.com/api/questions/${questionId}`);
      setQuestion(response.data);
    } catch (err) {
      console.error('Failed to fetch question:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading question...</div>;
  if (!question) return <div>Question not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* Problem Description */}
        <div style={styles.problemPanel}>
          <h2>{question.title}</h2>
          <div style={styles.difficulty}>
            <span style={{ 
              ...styles.difficultyBadge,
              backgroundColor: getDifficultyColor(question.difficulty)
            }}>
              {question.difficulty.toUpperCase()}
            </span>
          </div>
          <div style={styles.description}>{question.description}</div>
          
          {/* Function Signature */}
          <div style={styles.signature}>
            <strong>Function Signature:</strong>
            <pre>{question.functionName}(...)</pre>
          </div>

          {/* Examples */}
          {question.testCases && question.testCases.length > 0 && (
            <div style={styles.examples}>
              <h4>Examples:</h4>
              {question.testCases.map((tc, idx) => (
                <div key={idx} style={styles.example}>
                  <strong>Example {idx + 1}:</strong>
                  <pre>Input: {JSON.stringify(tc.input, null, 2)}</pre>
                  <pre>Output: {tc.output}</pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Code Editor and Results */}
        <div style={styles.editorPanel}>
          <CodeSubmission 
            questionId={questionId}
            starterCode={question.starterCode?.['71'] || ''} // Default to Python
          />
        </div>
      </div>

      {/* Results Panel (if exists) */}
      {results && (
        <ResultsSummary results={results} />
      )}
    </div>
  );
};

/**
 * Alternative: Using hook directly with custom UI
 */
const DSAInterviewAdvanced = ({ questionId }) => {
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('71');
  const { submitCode, results, loading, error } = useCodeEvaluation();

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`https://goalnow.onrender.com/api/questions/${questionId}`);
      setQuestion(response.data);
      setCode(response.data.starterCode?.['71'] || '');
    } catch (err) {
      console.error('Failed to fetch question:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await submitCode(questionId, code, language);
      
      // Custom handling based on result
      if (result.success) {
        // All tests passed - show celebration animation
        showSuccessAnimation();
        // Could save to user profile, show certificate, etc.
      } else if (!result.compilation.success) {
        // Show more detailed compilation error
        showCompilationError(result.compilation.error);
      } else {
        // Some tests failed - show which ones
        showFailedTests(result.publicTests.results);
      }
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  if (!question) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      {/* Problem Statement */}
      <div style={styles.problemPanel}>
        <h1>{question.title}</h1>
        <div>{question.description}</div>
      </div>

      {/* Code & Results Layout */}
      <div style={styles.workspace}>
        {/* Editor */}
        <div style={styles.editorSection}>
          <div style={styles.header}>
            <h3>Solution</h3>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="71">Python</option>
              <option value="63">JavaScript</option>
              <option value="62">Java</option>
              <option value="54">C++</option>
            </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={styles.codeArea}
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? '⏳ Evaluating...' : '✅ Submit & Test'}
          </button>
        </div>

        {/* Results */}
        <div style={styles.resultsSection}>
          {error && (
            <div style={styles.errorBox}>
              <h4>❌ Error</h4>
              <p>{error}</p>
            </div>
          )}

          {results && (
            <div>
              <TestResultsSummary results={results} />
              <TestCasesList results={results} />
            </div>
          )}

          {!results && !error && (
            <div style={styles.placeholder}>
              <p>📝 Submit your code to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Component: Results Summary Card
 */
const ResultsSummary = ({ results }) => {
  const { success, compilation, publicTests, hiddenTests } = results;

  return (
    <div style={{
      ...styles.resultsSummary,
      borderColor: success ? '#388e3c' : '#d32f2f'
    }}>
      <h3 style={{ color: success ? '#388e3c' : '#d32f2f' }}>
        {success ? '✅ All Tests Passed!' : '❌ Some Tests Failed'}
      </h3>

      {!compilation.success && (
        <div style={styles.compilationError}>
          <strong>Compilation Error:</strong>
          <pre>{compilation.error}</pre>
        </div>
      )}

      {compilation.success && (
        <div style={styles.stats}>
          <div style={styles.statBox}>
            <div style={styles.statTitle}>Public Tests</div>
            <div style={styles.statValue}>
              {publicTests.passed}/{publicTests.total}
            </div>
          </div>
          
          {hiddenTests && (
            <div style={styles.statBox}>
              <div style={styles.statTitle}>Hidden Tests</div>
              <div style={styles.statValue}>
                {hiddenTests.passed}/{hiddenTests.total}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Component: Test Cases List
 */
const TestCasesList = ({ results }) => {
  const [expandedIdx, setExpandedIdx] = React.useState(null);
  const testCases = results.publicTests?.results || [];

  if (!testCases.length) return null;

  return (
    <div style={styles.testCasesContainer}>
      <h4>Test Cases</h4>
      {testCases.map((tc, idx) => (
        <div key={idx} style={styles.testCaseCard}>
          <div
            style={styles.testCaseHeader}
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedIdx(expandedIdx === idx ? null : idx); } }}
          >
            <span>
              {tc.passed ? '✅' : '❌'} Test Case {idx + 1}
            </span>
            <span>{expandedIdx === idx ? '▼' : '▶'}</span>
          </div>
          
          {expandedIdx === idx && (
            <div style={styles.testCaseDetail}>
              <div>
                <strong>Input:</strong>
                <pre>{tc.input}</pre>
              </div>
              <div>
                <strong>Expected:</strong>
                <pre>{tc.expected}</pre>
              </div>
              <div>
                <strong>Got:</strong>
                <pre style={{ color: tc.passed ? '#388e3c' : '#d32f2f' }}>
                  {tc.actual || '(empty)'}
                </pre>
              </div>
              {tc.error && (
                <div>
                  <strong style={{ color: '#d32f2f' }}>Error:</strong>
                  <pre style={{ color: '#d32f2f' }}>{tc.error}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Helper function to get difficulty color
 */
function getDifficultyColor(difficulty) {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return '#4caf50';
    case 'medium':
      return '#ff9800';
    case 'hard':
      return '#f44336';
    default:
      return '#999';
  }
}

// ==================== STYLES ====================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    gap: '20px',
    padding: '20px',
  },
  problemPanel: {
    flex: 1,
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    overflowY: 'auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  difficulty: {
    margin: '12px 0',
  },
  difficultyBadge: {
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  description: {
    lineHeight: '1.6',
    color: '#333',
    marginBottom: '20px',
  },
  signature: {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  examples: {
    backgroundColor: '#f9f9f9',
    padding: '12px',
    borderRadius: '4px',
  },
  example: {
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #eee',
  },
  editorPanel: {
    flex: 1.2,
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  resultsSummary: {
    backgroundColor: '#f5f5f5',
    border: '2px solid',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '20px',
  },
  compilationError: {
    backgroundColor: '#ffebee',
    padding: '12px',
    borderRadius: '4px',
    marginTop: '12px',
    color: '#c62828',
  },
  stats: {
    display: 'flex',
    gap: '20px',
    marginTop: '12px',
  },
  statBox: {
    flex: 1,
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
  },
  statTitle: {
    fontSize: '12px',
    color: '#666',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: '4px',
  },
  workspace: {
    display: 'flex',
    gap: '20px',
    flex: 1,
  },
  editorSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  resultsSection: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    overflow: 'auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    borderBottom: '1px solid #eee',
  },
  codeArea: {
    flex: 1,
    padding: '12px',
    fontFamily: 'monospace',
    fontSize: '14px',
    border: 'none',
    resize: 'none',
  },
  submitBtn: {
    padding: '12px 20px',
    margin: '12px',
    backgroundColor: '#388e3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  placeholder: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
  },
  testCasesContainer: {
    marginTop: '20px',
  },
  testCaseCard: {
    border: '1px solid #eee',
    borderRadius: '4px',
    marginBottom: '8px',
    overflow: 'hidden',
  },
  testCaseHeader: {
    padding: '12px',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    userSelect: 'none',
  },
  testCaseDetail: {
    padding: '12px',
    backgroundColor: '#fafafa',
    borderTop: '1px solid #eee',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: '12px',
    borderRadius: '4px',
    color: '#c62828',
    marginBottom: '12px',
  }
};

export default DSAInterviewWithEvaluation;
export { DSAInterviewAdvanced, ResultsSummary, TestCasesList };
