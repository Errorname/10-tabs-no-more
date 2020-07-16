const createState = (reducer) => {
  let state = {
    status: 'asleep',
    combo: 0,
    timeout: null,
  }

  const queue = []
  let currentJob = null

  const dispatch = (action) => {
    queue.push(action)
    if (!currentJob) {
      currentJob = next()
    }
  }

  const next = async () => {
    if (queue.length > 0) {
      const action = queue.shift()
      const nextState = await reducer(state, action)
      console.log(state, action, nextState)
      state = nextState
      return next()
    } else {
      currentJob = null
    }
  }

  return { dispatch }
}
