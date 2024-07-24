export function getLocalSetting(setting) {
  const val = localStorage.getItem(`setting-${setting}`)
  if (val === 'true') {
    return true
  }
  if (val === 'false') {
    return false
  }

  return val
}

export function setLocalSetting(setting, val) {
  localStorage.setItem(`setting-${setting}`, val)
}