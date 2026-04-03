import { useCallback } from 'react'
import apiClient from '../../../../services/authService'

export function useProctoring() {
  const finalizeProctoring = useCallback(async (authToken, evaluationStatuses) => {
    if (!authToken) return
    try {
      console.log('📤 Finalizing proctoring...')
      const evaluationIds = Object.values(evaluationStatuses)
        .map((item) => item?.evaluationId)
        .filter(Boolean)

      const token = localStorage.getItem('authToken')
      if (!token) {
        console.warn('⚠️ Proctoring finalize: No token found')
        return
      }
      console.log('✓ Finalize proctoring: Auth token found, length:', token.length)
      
      const res = await apiClient.post('/evaluation/proctoring/finalize', {
        interviewType: 'technical',
        evaluationIds,
      })

      console.log('✅ Proctoring finalized, response:', res.data)
      
      const summary = res.data?.summary
      if (summary?.malpracticeDetected) {
        console.warn('⚠️ Proctoring note recorded:', summary.alerts)
      }
    } catch (error) {
      console.error('❌ Failed to finalize proctoring:', error.response?.data || error.message)
    }
  }, [])

  return { finalizeProctoring }
}
