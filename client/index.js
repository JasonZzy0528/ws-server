import * as ChainPad from './bower_components/chainpad/chainpad.dist'
import serverConf from '../config'
import './index.scss'

import { editorInit, listenOnChange, getEditorHyperjson, hjsonToDom, mkDiffOptions } from './editor'
import DiffDOM from 'diff-dom'
import Cursor from './cursor'

const el = document.querySelector('#log-textarea')

const editor = editorInit(el)
let msgNum = 0

CKEDITOR.once('instanceReady', () => {
  const initialState = JSON.stringify(getEditorHyperjson(editor))
  const userName = window.location.pathname.replace('/', '')
  const config = {
    userName: userName,
    initialState,
    diffBlockSize: 100,
    // checkpointInterval: 1
  }
  const chainpad = ChainPad.create(config)

  listenOnChange(editor, chainpad)
  const wsAddress = `ws://${window.location.hostname}:${serverConf.wsport}`
  let socket = new WebSocket(wsAddress)

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
        const newContent = JSON.stringify(getEditorHyperjson(editor))
        chainpad.contentUpdate(newContent)
        chainpad.message(data)
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
    setTimeout(() => {
      cb()
    },1)
  })
  const inner = editor.editable().$
  const cursor = Cursor(inner)
  var DD = new DiffDOM(mkDiffOptions(cursor, editor.focusManager.hasFocus))

  const contentUpdate = () => {
    const hjson = JSON.parse(chainpad.getUserDoc())
    var userDocStateDom = hjsonToDom(hjson)
    userDocStateDom.normalize()
    inner.normalize()
    var patch = DD.diff(inner, userDocStateDom)
    DD.apply(inner, patch)
  }

  chainpad.onPatch(() => {
    contentUpdate()
  })
  chainpad.start()
  window.chainpad = chainpad

  // window.setInterval(() => {
  //   chainpad.onSettle(() => {
  //     contentUpdate()
  //   })
  // }, 2000)
})
