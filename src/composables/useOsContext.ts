import * as os from 'node:os'
import { ref, useDisposable, watchEffect } from 'reactive-vscode'
import { config } from '../config'

export interface OsContext {
  platform: string
  arch: string
  uptime: string
  freemem: string
  totalmem: string
  cpuUsage: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

export function useOsContext() {
  const stats = ref<OsContext>({
    platform: os.platform(),
    arch: os.arch(),
    uptime: '00:00:00',
    freemem: '0 B',
    totalmem: '0 B',
    cpuUsage: '0%',
  })

  let lastCpus = os.cpus()
  let currentTimer: NodeJS.Timeout | null = null

  function updateStats() {
    const currentCpus = os.cpus()
    let idleDiff = 0
    let totalDiff = 0

    for (let i = 0; i < currentCpus.length; i++) {
      const last = lastCpus[i].times
      const current = currentCpus[i].times
      const lastTotal = last.user + last.nice + last.sys + last.idle + last.irq
      const currentTotal = current.user + current.nice + current.sys + current.idle + current.irq

      idleDiff += current.idle - last.idle
      totalDiff += currentTotal - lastTotal
    }

    const cpuUsage = totalDiff > 0 ? ((totalDiff - idleDiff) / totalDiff) * 100 : 0
    lastCpus = currentCpus

    stats.value = {
      platform: os.platform(),
      arch: os.arch(),
      uptime: formatUptime(os.uptime()),
      freemem: formatBytes(os.freemem()),
      totalmem: formatBytes(os.totalmem()),
      cpuUsage: `${Math.round(cpuUsage)}%`,
    }
  }

  // 2. Use watchEffect to track changes to config['os.interval'] automatically
  watchEffect(() => {
    // Teardown previous loop
    if (currentTimer) {
      clearInterval(currentTimer)
    }

    // Access the config directly.
    const userInterval = config['interpolation.os.interval']
    const safeInterval = Math.max(userInterval, 500)

    // Set up the new loop
    currentTimer = setInterval(updateStats, safeInterval)
    updateStats()
  })

  // 3. Clear interval on scope disposal
  useDisposable({
    dispose: () => {
      if (currentTimer) {
        clearInterval(currentTimer)
      }
    },
  })

  return stats
}
