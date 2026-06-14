'use client'

import { useCallback, useEffect, useState } from 'react'
import { getHealth } from './api'
import { STORAGE_KEYS } from './presets'
import type {
  AgentCycleRequest,
  AgentCycleResponse,
  FrontendSettings,
  HealthResponse,
} from './types'

const DEFAULT_SETTINGS: FrontendSettings = {
  defaultVenue: 'hyperliquid',
  defaultPreset: 'hyperliquidSmoke',
  enableAdvanced: false,
  autoSaveResult: true,
}

export type HealthStatus = 'checking' | 'healthy' | 'offline'

export function useBackendHealth(pollMs = 0) {
  const [status, setStatus] = useState<HealthStatus>('checking')
  const [health, setHealth] = useState<HealthResponse | null>(null)

  const check = useCallback(async () => {
    setStatus('checking')
    try {
      const data = await getHealth()
      setHealth(data)
      setStatus(data?.ok === false ? 'offline' : 'healthy')
    } catch {
      setHealth(null)
      setStatus('offline')
    }
  }, [])

  useEffect(() => {
    check()
    if (pollMs > 0) {
      const id = setInterval(check, pollMs)
      return () => clearInterval(id)
    }
  }, [check, pollMs])

  return { status, health, refresh: check }
}

export function useLatestCycleResult() {
  const [result, setResult] = useState<AgentCycleResponse | null>(null)
  const [payload, setPayload] = useState<AgentCycleRequest | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.latestResult)
      if (raw) setResult(JSON.parse(raw))
      const p = localStorage.getItem(STORAGE_KEYS.latestPayload)
      if (p) setPayload(JSON.parse(p))
    } catch {
      /* ignore */
    }
    setLoaded(true)
  }, [])

  const save = useCallback(
    (res: AgentCycleResponse, req?: AgentCycleRequest) => {
      setResult(res)
      try {
        localStorage.setItem(STORAGE_KEYS.latestResult, JSON.stringify(res))
        if (req) {
          setPayload(req)
          localStorage.setItem(STORAGE_KEYS.latestPayload, JSON.stringify(req))
        }
      } catch {
        /* ignore quota errors */
      }
    },
    [],
  )

  const clear = useCallback(() => {
    setResult(null)
    setPayload(null)
    try {
      localStorage.removeItem(STORAGE_KEYS.latestResult)
      localStorage.removeItem(STORAGE_KEYS.latestPayload)
    } catch {
      /* ignore */
    }
  }, [])

  return { result, payload, loaded, save, clear }
}

export function useSettings() {
  const [settings, setSettings] = useState<FrontendSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.settings)
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) })
    } catch {
      /* ignore */
    }
    setLoaded(true)
  }, [])

  const update = useCallback((patch: Partial<FrontendSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return { settings, update, loaded }
}
