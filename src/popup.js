const container = document.querySelector('.container')
const powerOff = document.querySelector('.power-off')
const maxTabs = document.querySelector('#max_tabs')
const countdown = document.querySelector('#countdown')
const strategyRandom = document.querySelector('#random')
const strategyLeastUsed = document.querySelector('#least_used')

/* Disable extension */
const onDisabledValue = (val) => {
  if (val) {
    container.classList.add('disabled')
  } else {
    container.classList.remove('disabled')
  }
}

getConfiguration('disabled').then(onDisabledValue)

onConfigurationChange('disabled', onDisabledValue)

powerOff.addEventListener('click', () => {
  if (container.classList.contains('disabled')) {
    setConfiguration('disabled', false)
  } else {
    setConfiguration('disabled', true)
  }
})

/* Configure max tabs */
const onMaxTabsValue = (val) => {
  maxTabs.value = val
}

getConfiguration('max_tabs').then(onMaxTabsValue)

onConfigurationChange('max_tabs', onMaxTabsValue)

maxTabs.addEventListener('change', (e) => {
  setConfiguration('max_tabs', e.target.value)
})

/* Configure countdown */
const onTimeBeforeCloseValue = (val) => {
  countdown.value = val
}

getConfiguration('time_before_close').then(onTimeBeforeCloseValue)

onConfigurationChange('time_before_close', onTimeBeforeCloseValue)

countdown.addEventListener('change', (e) => {
  setConfiguration('time_before_close', e.target.value)
})

/* Configure strategy */
const onStrategyValue = (val) => {
  if (val === 'random') {
    strategyRandom.checked = true
    strategyLeastUsed.checked = false
  } else {
    strategyRandom.checked = false
    strategyLeastUsed.checked = true
  }
}

getConfiguration('strategy').then(onStrategyValue)

onConfigurationChange('time_before_close', onStrategyValue)

strategyRandom.addEventListener('change', () => {
  setConfiguration('strategy', 'random')
})

strategyLeastUsed.addEventListener('change', () => {
  setConfiguration('strategy', 'least_used')
})
