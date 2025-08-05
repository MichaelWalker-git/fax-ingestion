import { useEffect, useState } from 'react'

export function useRemainingProcessingTime(totalPages: number, secondsPerPage = 31) {
  const totalSeconds = totalPages * secondsPerPage
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setRemainingSeconds(totalSeconds)

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [totalPages, secondsPerPage])

  return Math.ceil(remainingSeconds / 60) || 1
}
