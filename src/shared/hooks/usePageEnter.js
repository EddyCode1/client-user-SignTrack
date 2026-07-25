import { useEffect } from 'react'

export const usePageEnter = (callback) => {
  useEffect(() => {
    callback()
  }, [])
}
