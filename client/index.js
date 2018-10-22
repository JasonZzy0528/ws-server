import { pullAt } from 'lodash'
import './index.scss'
import * as ChainPad from './bower_components/chainpad/chainpad.dist'
import { transform } from './text-cursor'
import { RESPONSE_ACK } from '../constants'
import serverConf from '../config'

const textarea = document.querySelector('#log-textarea')
let selectionStart
let content = textarea.value

const config = {
  username: 'username',
  initalValue: content
}
const chainpad = ChainPad.create(config)

const wsAddress = `ws://${window.location.hostname}:${serverConf.wsport}`
let socket = new WebSocket(wsAddress)
let queue = []

textarea.addEventListener('keyup', evt => {
  const el = evt.srcElement
  selectionStart = textarea.selectionStart
  console.error('keyup', el.value, chainpad.getUserDoc(), selectionStart)
  const value = el.value
  const userDoc = chainpad.getUserDoc()
  if (value !== userDoc) {
    chainpad.contentUpdate(el.value)
    chainpad.sync()
  }
})

textarea.addEventListener('focus', () => {
  selectionStart = textarea.selectionStart
})

textarea.addEventListener('blur', () => {
  selectionStart = null
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
        console.error('socket onmessage', textarea.selectionStart, chainpad.getAuthDoc(), chainpad.getUserDoc())
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
    console.error('onMessage', chainpad.getLag(), chainpad.getUserDoc())
    socket.send(message)
    queue.push(cb)
  })
}

chainpad.onChange(function (offset, toRemove, toInsert) {
  console.error('onchange', offset, toRemove, toInsert, selectionStart)
  const oldContent = textarea.value
  const newContent = chainpad.getUserDoc()
  const ops = ChainPad.Diff.diff(oldContent, newContent)
  let cursorPosition = selectionStart
  textarea.value = newContent
  cursorPosition = transform(cursorPosition, ops)
  textarea.selectionStart = cursorPosition
  textarea.selectionEnd = cursorPosition
  selectionStart = textarea.selectionStart
})

// chainpad.onPatch(patch => {
//   console.error('onPatch', patch, textarea.selectionStart, chainpad.getUserDoc())
// })

chainpad.start()
window.chainpad = chainpad
window.queue = queue
