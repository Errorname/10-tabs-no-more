let timeoutId = null

const startCountdown = (time) => {
  let countdown = time
  browser.browserAction.setBadgeText({ text: `${countdown--}` })

  if (browser.browserAction.setBadgeBackgroundColor) {
    browser.browserAction.setBadgeBackgroundColor({
      color: '#DD4124',
    })
    if (browser.browserAction.setBadgeTextColor) {
      browser.browserAction.setBadgeTextColor({
        color: '#FFFFFF',
      })
    }
  }

  const tick = () => {
    timeoutId = setTimeout(() => {
      browser.browserAction.setBadgeText({ text: `${countdown--}` })
      if (countdown > 0) {
        tick()
      }
    }, 1000)
  }

  tick()
}

const stopCountdown = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  timeoutId = null
  browser.browserAction.setBadgeText({ text: null })
}
