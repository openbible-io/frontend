import { ReaderState } from '../components/readers/readers'

function getKey() {
  return 'readers'
}

export function getLocalReaders(): ReaderState[] {
  const key = getKey()
  return JSON.parse(localStorage.getItem(key) as string) || []
}

export function setLocalReaders(readers: ReaderState[]) {
  const key = getKey()
  localStorage.setItem(key, JSON.stringify(readers))
}
