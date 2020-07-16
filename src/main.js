const reducer = async (state, action) => {
  const time_before_close = await getConfiguration('time_before_close')
  const time_before_combo_close = await getConfiguration('time_before_combo_close')

  switch (action) {
    case 'init':
      if (await getConfiguration('disabled')) {
        return {
          status: 'disabled',
          combo: 0,
          timeout: null,
        }
      }
    case 'enable':
      if (await exceedMaxTabs()) {
        notifyExcess()
        startCountdown(time_before_close)
        return {
          status: 'awake',
          combo: 0,
          timeout: waitToKill(time_before_close),
        }
      }
      return {
        status: 'asleep',
        combo: 0,
        timeout: null,
      }
    case 'disable':
      stopCountdown()
      if (state.timeout) {
        clearTimeout(state.timeout)
      }
      return {
        status: 'disabled',
        combo: 0,
        timeout: null,
      }
    case 'create_tab':
      if (state.status === 'disabled') return state

      if (!state.timeout && (await exceedMaxTabs())) {
        notifyExcess()
        startCountdown(time_before_close)
        return {
          status: 'awake',
          combo: 0,
          timeout: waitToKill(time_before_close),
        }
      }
      return state
    case 'try_kill':
      if (state.status === 'disabled') return state

      if (await exceedMaxTabs()) {
        await killTab()

        return {
          ...state,
          combo: state.combo + 1,
          timeout: null,
        }
      }
      return state
    case 'remove_tab':
      if (state.status === 'disabled') return state

      if (await exceedMaxTabs()) {
        if (state.timeout) {
          return state
        } else {
          startCountdown(time_before_combo_close)
          return {
            ...state,
            status: 'awake',
            timeout: waitToKill(time_before_combo_close),
          }
        }
      } else {
        if (state.timeout) {
          clearTimeout(state.timeout)
        }

        stopCountdown()

        if (state.combo > 0) {
          notifyKills(state.combo)
        } else {
          if (state.status === 'awake') {
            // Disabled this notification because it feels "spammy"
            //notifyAvoided()
          }
        }

        return {
          status: 'asleep',
          combo: 0,
          timeout: null,
        }
      }
    case 'update_max_tabs':
      if (state.status === 'disabled') return state

      if (state.timeout) {
        if (await exceedMaxTabs()) {
          return state
        } else {
          clearTimeout()

          stopCountdown()

          if (state.combo > 0) {
            notifyKills(state.combo)
          } else {
            // Disabled this notification because it feels "spammy"
            //notifyAvoided()
          }

          return {
            status: 'asleep',
            combo: 0,
            timeout: null,
          }
        }
      } else {
        if (await exceedMaxTabs()) {
          notifyExcess()
          startCountdown(time_before_close)
          return {
            status: 'awake',
            combo: 0,
            timeout: waitToKill(time_before_close),
          }
        } else {
          return state
        }
      }
  }
}

const { dispatch } = createState(reducer)

const exceedMaxTabs = async () => {
  const currentCount = (await browser.tabs.query({})).length
  const maxTabs = await getConfiguration('max_tabs')
  return currentCount > maxTabs
}

const killTab = async () => {
  const strategy = await getConfiguration('strategy')
  const tabs = await browser.tabs.query({})

  if (strategy === 'random') {
    const pickedTab = tabs[Math.floor(Math.random() * tabs.length)]

    await browser.tabs.remove(pickedTab.id)
  } else if (strategy === 'least_used') {
    const sortedTabs = tabs.sort((a, b) => {
      if (a.active) return -1
      if (b.active) return 1
      if (a.audible) return -1
      if (b.audible) return 1
      if (tabsActivity[a.id] - tabsActivity[b.id] !== 0)
        return tabsActivity[a.id] - tabsActivity[b.id]
      return Math.floor(Math.random() * 3) - 1
    })

    await browser.tabs.remove(sortedTabs.pop().id)
  }
}

const waitToKill = (time) =>
  setTimeout(() => {
    dispatch('try_kill')
  }, time * 1000)

/* Add listeners and init state */

const tabsActivity = {}

storageReady.then(() => {
  browser.tabs.query({}).then((tabs) => {
    tabs.map(({ id }) => {
      tabsActivity[id] = new Date().getTime()
    })

    browser.tabs.onCreated.addListener(({ id }) => {
      tabsActivity[id] = new Date().getTime()
      dispatch('create_tab')
    })
    browser.tabs.onActivated.addListener(({ tabId }) => {
      tabsActivity[tabId] = new Date().getTime()
    })
    browser.tabs.onRemoved.addListener((tabId) => {
      delete tabsActivity[tabId]
      dispatch('remove_tab')
    })

    onConfigurationChange('max_tabs', () => dispatch('update_max_tabs'))
    onConfigurationChange('disabled', (disabled) => dispatch(disabled ? 'disable' : 'enable'))

    dispatch('init')
  })
})
