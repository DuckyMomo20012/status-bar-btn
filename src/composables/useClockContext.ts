import type { MaybeRefOrGetter } from 'reactive-vscode'
import { computed, ref, toRef, useDisposable } from 'reactive-vscode'

export interface ClockFormats {
  /** 24-hour format: "17:18:42" */
  hhmmss: string
  /** 24-hour short format: "17:18" */
  hhmm: string
  /** 12-hour format: "5:18:42 PM" */
  ampm: string
  /** Long date format: "July 10, 2026" */
  fullDate: string
}

export function useClockContext(timeZone?: MaybeRefOrGetter<string | undefined>) {
  const currentTime = ref(new Date())

  // NOTE: Establish the background ticks loop
  const clockTimer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  useDisposable({
    dispose: () => {
      clearInterval(clockTimer)
    },
  })

  // NOTE: Normalize the input parameter into a reactive Ref  wrapper
  // This safely handles raw strings, Vue refs, and functional getters like ()
  // => btn.value...
  const tzRef = timeZone !== undefined ? toRef(timeZone) : ref(undefined)

  // 3. Return the single computed context layout object
  return computed<ClockFormats>(() => {
    const time = currentTime.value
    const currentTz = tzRef.value

    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone: currentTz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }

    let hhmmss = ''
    try {
      hhmmss = time.toLocaleTimeString('en-US', formatOptions)
    }
    catch {
      // Fallback loop if timezone formatting fails or is unknown
      hhmmss = time.toLocaleTimeString('en-US', { ...formatOptions, timeZone: undefined })
    }

    const parts = hhmmss.split(':')

    const ampm = time.toLocaleTimeString(undefined, {
      timeZone: currentTz,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })

    const fullDate = time.toLocaleDateString(undefined, {
      timeZone: currentTz,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    return {
      hhmmss,
      hhmm: `${parts[0]}:${parts[1]}`,
      ampm,
      fullDate,
    }
  })
}
