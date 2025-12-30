'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  getProgress,
  getCurrentProgress,
  startConcept,
  completeConcept,
  startDay,
  completeDay,
  type UserProgress,
  type CurrentProgress,
} from '../lib/api-roadmap'

export function useProgress(projectId: string) {
  const { getToken } = useAuth()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [current, setCurrent] = useState<CurrentProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async () => {
    if (!projectId) return

    try {
      const token = await getToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      setLoading(true)
      setError(null)
      const [progressData, currentData] = await Promise.all([
        getProgress(projectId, token),
        getCurrentProgress(projectId, token),
      ])
      setProgress(progressData)
      setCurrent(currentData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress')
    } finally {
      setLoading(false)
    }
  }, [projectId, getToken])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const handleStartConcept = useCallback(async (conceptId: string) => {
    try {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')
      await startConcept(projectId, conceptId, token)
      await fetchProgress()
    } catch (err) {
      throw err
    }
  }, [projectId, fetchProgress, getToken])

  const handleCompleteConcept = useCallback(async (conceptId: string) => {
    try {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')
      await completeConcept(projectId, conceptId, token)
      await fetchProgress()
    } catch (err) {
      throw err
    }
  }, [projectId, fetchProgress, getToken])

  const handleStartDay = useCallback(async (dayId: string) => {
    try {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')
      await startDay(projectId, dayId, token)
      await fetchProgress()
    } catch (err) {
      throw err
    }
  }, [projectId, fetchProgress, getToken])

  const handleCompleteDay = useCallback(async (dayId: string) => {
    try {
      const token = await getToken()
      if (!token) throw new Error('Authentication required')
      await completeDay(projectId, dayId, token)
      await fetchProgress()
    } catch (err) {
      throw err
    }
  }, [projectId, fetchProgress, getToken])

  return {
    progress,
    current,
    loading,
    error,
    refetch: fetchProgress,
    startConcept: handleStartConcept,
    completeConcept: handleCompleteConcept,
    startDay: handleStartDay,
    completeDay: handleCompleteDay,
  }
}

