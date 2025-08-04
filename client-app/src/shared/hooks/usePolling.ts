import { useEffect, useState } from 'react'

interface UsePollingOptions {
  apiCall: () => Promise<{ status: string } | null>
  checkDone: (data: { status: string } | null) => boolean
  interval?: number
  skip?: boolean
}

const usePolling = ({ apiCall, checkDone, interval = 4000, skip }: UsePollingOptions) => {
  const [loading, setLoading] = useState(!skip)
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await apiCall()
        setData(result)
        if (checkDone(result)) {
          setLoading(false)
          clearInterval(intervalId)
        }
      } catch (err) {
        console.error(err)
        setError('Failed to fetch status')
        setLoading(false)
        clearInterval(intervalId)
      }
    }
    let intervalId: NodeJS.Timeout

    if (!skip) {
      setLoading(true)
      fetchStatus()
      intervalId = setInterval(fetchStatus, interval)
    }

    return () => intervalId && clearInterval(intervalId)
  }, [interval, skip])

  return { loading, data, error }
}

export default usePolling
