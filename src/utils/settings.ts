export function getLocalSetting(setting: string) {
  return localStorage.getItem(`setting-${setting}`)
}

export function setLocalSetting(setting: string, val: string) {
  localStorage.setItem(`setting-${setting}`, val)
}