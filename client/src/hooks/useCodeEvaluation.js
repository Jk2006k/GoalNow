/**
 * DSA Interview Integration Example
 * 
 * This hook provides a higher-level interface for managing code submissions
 * and evaluation results in the DSA interview flow.
 * 
 * Usage:
 * const { submitCode, results, loading, error } = useCodeEvaluation();
 * await submitCode(questionId, userCode, languageId);
 */

import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://goalnow.onrender.com';

/**
 * Custom hook for code evaluation
 */
export const useCodeEvaluation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  /**
   * Submit code for evaluation
   */
  const submitCode = useCallback(async (questionId, userCode, languageId, userId = null) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(`${API_URL}/api/submit`, {
        userCode,
        questionId,
        languageId,
        userId: userId || localStorage.getItem('userId') || 'anonymous'
      });

      setResults(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.details || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Run quick tests (without submitting to database)
   */
  const runQuickTests = useCallback(async (userCode, languageId, testCases) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/run-tests`, {
        userCode,
        language_id: languageId,
        testCases
      });

      setResults(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get evaluation statistics for a question
   */
  const getStats = useCallback(async (questionId) => {
    try {
      const response = await axios.get(`${API_URL}/api/evaluation/stats/${questionId}`);
      return response.data.data;
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      throw err;
    }
  }, []);

  /**
   * Clear results and errors
   */
  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    submitCode,
    runQuickTests,
    getStats,
    clearResults
  };
};

/**
 * Helper function to check if submission is accepted
 */
export const isSubmissionAccepted = (results) => {
  if (!results) return false;
  return (
    results.compilation?.success &&
    results.publicTests?.failed === 0 &&
    (!results.hiddenTests || results.hiddenTests.failed === 0)
  );
};

/**
 * Helper function to get submission progress percentage
 */
export const getSubmissionProgress = (results) => {
  if (!results || !results.publicTests) return 0;

  const total = results.publicTests.total + (results.hiddenTests?.total || 0);
  const passed = results.publicTests.passed + (results.hiddenTests?.passed || 0);

  return Math.round((passed / total) * 100);
};

/**
 * Format evaluation error message for display
 */
export const formatEvaluationError = (results) => {
  if (!results) return 'Unknown error';

  if (!results.compilation.success) {
    return `Compilation Error:\n${results.compilation.error}`;
  }

  if (results.publicTests.failed > 0) {
    return `${results.publicTests.failed} test case(s) failed.\nCheck the details below.`;
  }

  if (results.hiddenTests && results.hiddenTests.failed > 0) {
    return `Your solution failed on hidden test cases. Please review your logic.`;
  }

  return 'Evaluation failed';
};

/**
 * Export results as JSON for debugging
 */
export const exportResultsAsJSON = (results) => {
  return JSON.stringify(results, null, 2);
};

export default useCodeEvaluation;
