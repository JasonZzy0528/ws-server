import { pullAt } from 'lodash'
import './index.scss'
import * as ChainPad from './bower_components/chainpad/chainpad.dist'
import { RESPONSE_ACK } from '../constants'

const textarea = document.querySelector('#log-textarea')
let content = textarea.value

const config = {
  username: 'username',
  initalValue: content
}
const chainpad = ChainPad.create(config)

let socket = new WebSocket('ws://10.4.4.210:8080/')
let hasFocus = false
let queue = []

textarea.addEventListener('keyup', evt => {
  const el = evt.srcElement
  chainpad.contentUpdate(el.value)
})

textarea.addEventListener('focus', () => {
  hasFocus = true
})

textarea.addEventListener('blur', () => {
  hasFocus = false
  textarea.focus()
})


socket.onopen = () => {
  socket.onmessage = evt => {
    try {
      const { type, data } = JSON.parse(evt.data)
      if (type === 'blocks') {
        data.forEach(block => {
          chainpad.message(block)
        })
      } else {
        chainpad.message(data)
      }
    } catch (err) {
      // pass
      if (evt.data === RESPONSE_ACK) {
        queue[0]()
        pullAt(queue, [0])
      }
    }
  }
  chainpad.onMessage((message, cb) => {
    socket.send(message)
    queue.push(cb)
  })
}

chainpad.onChange(function (offset, toRemove, toInsert) {
  content = textarea.value
  let cursorPosition
  if (hasFocus) {
    const selectionStart = textarea.selectionStart
    if (offset < selectionStart) {
      cursorPosition = selectionStart - toRemove + toInsert.length
    } else {
      cursorPosition = selectionStart
    }
  }
  content = content.substring(0, offset) + toInsert + content.substring(offset + toRemove)
  textarea.value = content
  if (cursorPosition !== undefined) {
    textarea.selectionStart = cursorPosition
    textarea.selectionEnd = cursorPosition
    console.error(cursorPosition)
  }
})

chainpad.start()
window.chainpad = chainpad
window.queue = queue
