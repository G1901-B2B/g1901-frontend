'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  getRoadmap,
  getDayDetails,
  getConceptDetails,
  getGenerationStatus,
  type RoadmapDay,
  type DayDetails,
  type ConceptDetails,
  type GenerationStatus,
} from '../lib/api-roadmap'

export function useRoadmap(projectId: string) {
  const { getToken } = useAuth()
  const [days, setDays] = useState<RoadmapDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null)

  useEffect(() => {
    if (!projectId) return

    async function fetchRoadmap() {
      try {
        const token = await getToken()
        if (!token) {
          setError('Authentication required')
          return
        }

        setLoading(true)
        setError(null)
        const [roadmapData, statusData] = await Promise.all([
          getRoadmap(projectId, token),
          getGenerationStatus(projectId, token),
        ])
        setDays(roadmapData.days)
        setGenerationStatus(statusData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load roadmap')
      } finally {
        setLoading(false)
      }
    }

    fetchRoadmap()

    // Poll for updates if still generating
    const interval = setInterval(async () => {
      if (generationStatus?.is_generating) {
        try {
          const token = await getToken()
          if (token) {
            const roadmapData = await getRoadmap(projectId, token)
            setDays(roadmapData.days)
            const statusData = await getGenerationStatus(projectId, token)
            setGenerationStatus(statusData)
          }
        } catch (err) {
          // Silently fail polling
        }
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [projectId, generationStatus?.is_generating, getToken])

  const refetch = async () => {
    try {
      const token = await getToken()
      if (token) {
        const roadmapData = await getRoadmap(projectId, token)
        setDays(roadmapData.days)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refetch roadmap')
    }
  }

  return { days, loading, error, generationStatus, refetch }
}

export function useDayDetails(projectId: string, dayId: string | null) {
  const { getToken } = useAuth()
  const [dayDetails, setDayDetails] = useState<DayDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId || !dayId) {
      setDayDetails(null)
      return
    }

    async function fetchDayDetails() {
      try {
        const token = await getToken()
        if (!token) {
          setError('Authentication required')
          return
        }

        setLoading(true)
        setError(null)
        const data = await getDayDetails(projectId, dayId, token)
        setDayDetails(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load day details')
      } finally {
        setLoading(false)
      }
    }

    fetchDayDetails()
  }, [projectId, dayId, getToken])

  return { dayDetails, loading, error }
}

export function useConceptDetails(projectId: string, conceptId: string | null) {
  const { getToken } = useAuth()
  const [conceptDetails, setConceptDetails] = useState<ConceptDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId || !conceptId) {
      setConceptDetails(null)
      return
    }

    async function fetchConceptDetails() {
      try {
        const token = await getToken()
        if (!token) {
          setError('Authentication required')
          return
        }

        setLoading(true)
        setError(null)
        const data = await getConceptDetails(projectId, conceptId, token)
        setConceptDetails(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concept details')
      } finally {
        setLoading(false)
      }
    }

    fetchConceptDetails()
  }, [projectId, conceptId, getToken])

  return { conceptDetails, loading, error }
}

