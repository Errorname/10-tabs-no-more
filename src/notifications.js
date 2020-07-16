const createNotification = async (message, img) => {
  const max_tabs = await getConfiguration('max_tabs')
  browser.notifications
    .create(null, {
      type: 'basic',
      title: `${max_tabs} tabs, no more!`,
      iconUrl: browser.extension.getURL(`img/${img}.png`),
      message,
    })
    .catch(console.log)
}

const notifyExcess = async () => {
  const time_before_close = await getConfiguration('time_before_close')
  createNotification(
    `You have ${time_before_close} seconds to close tabs, otherwise, we'll do it for you.`,
    'stopwatch'
  )
}

const notifyAvoided = () => createNotification("You're good. For now...", 'thumbs-up')

const notifyKills = (combo) =>
  createNotification(
    `We closed ${combo} tab${combo === 1 ? '' : 's'} for you. You're welcome!`,
    'thumbs-up'
  )
