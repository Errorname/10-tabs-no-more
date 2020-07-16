/* DEFAULT VALUES */
const defaultValues = {
  disabled: false,
  max_tabs: 10,
  time_before_close: 30,
  time_before_combo_close: 2,
  strategy: 'random',
}
/* END */

const storageApi = new Promise(async (resolve) => {
  try {
    await browser.storage.sync.set({ test: true })
    resolve(browser.storage.sync)
    return
  } catch (e) {}
  resolve(browser.storage.local)
})

const getConfiguration = async (key) => {
  const store = await (await storageApi).get([key])
  return store[key]
}

const setConfiguration = async (key, value) => {
  return (await storageApi).set({ [key]: value })
}

const onConfigurationChange = (key, cb) =>
  browser.storage.onChanged.addListener((changes) => {
    if (changes[key]) {
      cb(changes[key].newValue)
    }
  })

/* If no configuration found, init with default values */
const storageReady = new Promise(async (resolve) => {
  const keys = Object.keys(defaultValues)

  for (let key of keys) {
    if ((await getConfiguration(key)) === undefined) {
      setConfiguration(key, defaultValues[key])
    }
  }

  resolve()
})
