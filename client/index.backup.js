import { isArray } from 'lodash'
import './index.scss'
import * as ChainPad from './bower_components/chainpad/chainpad.dist'
import { transform } from './text-cursor'
import { RESPONSE_ACK } from '../constants'
import serverConf from '../config'

const textarea = document.querySelector('#log-textarea')
let content = textarea.value
let msgNum = 0

const userName = window.location.pathname.replace('/', '')
const config = {
  userName: userName,
  initalValue: content
}
const chainpad = ChainPad.create(config)

const wsAddress = `ws://${window.location.hostname}:${serverConf.wsport}`
let socket = new WebSocket(wsAddress)
let queue = {}
let isFocusing = false

textarea.addEventListener('keyup', () => {
  const value = textarea.value
  console.error('keyup', value)

  chainpad.onSettle(() => {
    console.error('onSettle', chainpad.getAuthDoc())
    // const userDoc = chainpad.getUserDoc()
    chainpad.sync()
    // const oldContent = textarea.value
    // if (oldContent !== userDoc) {
    //   const ops = ChainPad.Diff.diff(oldContent, userDoc)
    //   let cursorPosition = textarea.selectionStart
    //   textarea.value = userDoc
    //   cursorPosition = transform(cursorPosition, ops, true)
    //   textarea.selectionStart = cursorPosition
    //   textarea.selectionEnd = cursorPosition
    // }
  })
  chainpad.contentUpdate(value)
})

// textarea.addEventListener('keydown', evt => {
//   evt.preventDefault()
//   let key = evt.key
//   let selectionStart = textarea.selectionStart
//   const userDoc = chainpad.getUserDoc()
//   let value
//   if (key.toLowerCase() === 'enter') {
//     // value = userDoc.substring(0, selectionStart + 1) + '\n' + userDoc.substring(selectionStart + 1, userDoc.length)
//     value = userDoc + '\n'
//   } else if (key.toLowerCase() === 'backspace') {
//     value = userDoc.substring(0, selectionStart) + userDoc.substring(selectionStart + 2, userDoc.length)
//   } else {
//     // console.error(userDoc.substring(0, selectionStart + 1), userDoc.substring(selectionStart + 1, userDoc.length))
//     // value = userDoc.substring(0, selectionStart + 1) + key + userDoc.substring(selectionStart + 1, userDoc.length)
//     value = userDoc + key
//   }
//   console.error(value)
//
//   chainpad.onSettle(() => {
//     const authDoc = chainpad.getAuthDoc()
//     chainpad.sync()
//     const oldContent = textarea.value
//     const ops = ChainPad.Diff.diff(oldContent, authDoc)
//     let cursorPosition = textarea.selectionStart
//     textarea.value = authDoc
//     cursorPosition = transform(cursorPosition, ops, true)
//     textarea.selectionStart = cursorPosition
//     textarea.selectionEnd = cursorPosition
//   })
//   chainpad.contentUpdate(value)
// })

textarea.addEventListener('focus', () => {
  // selectionStart = textarea.selectionStart
  isFocusing = true
})

textarea.addEventListener('blur', () => {
  // selectionStart = null
  isFocusing = false
})


socket.onopen = () => {
  socket.onmessage = evt => {
    const res = JSON.parse(evt.data)
    const data = res.data
    const type = res.type
    if (type === 'blocks') {
      data.forEach(block => {
        chainpad.message(block)
      })
    } else if (type === 'patch') {
      chainpad.message(data)
    }
    if (isArray(res)) {
      const queueNum = res[0]
      const queueStatus = res[1]
      if ( queueStatus === RESPONSE_ACK) {
        queue[queueNum]()
        delete queue[queueNum]
      }
    }
  }
}

chainpad.onMessage((message, cb) => {
  msgNum ++
  message = {
    message,
    msgNum
  }
  socket.send(JSON.stringify(message))
  queue[msgNum] = cb
})

chainpad.onChange(function (offset, toRemove, toInsert) {
  chainpad.sync()
  // const oldContent = textarea.value
  const newContent = chainpad.getUserDoc()
  console.error('onChange', newContent)
  // const ops = ChainPad.Diff.diff(oldContent, newContent)
  const ops = [{
    offset,
    toRemove,
    toInsert
  }]
  if (isFocusing) {
    let cursorPosition = textarea.selectionStart
    textarea.value = newContent
    cursorPosition = transform(cursorPosition, ops)
    textarea.selectionStart = cursorPosition
    textarea.selectionEnd = cursorPosition
  } else {
    textarea.value = newContent
  }
})

chainpad.start()
window.chainpad = chainpad
window.queue = queue
