import express from 'express'
import history from 'connect-history-api-fallback'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import WebSocket from 'ws'
import path from 'path'

import { RESPONSE_ACK } from './constants'
import config from './config'
import logger from './logger'
import webpackDevConf from './webpack/conf.dev'

const wss = new WebSocket.Server({ port: config.wsport })

const app = express()
const port = config.port

let compiler = webpack(webpackDevConf)
let devMiddleware = webpackDevMiddleware(compiler, {
  publicPath: '/',
  index: config.output,
  noInfo: false,
  stats: {
    children: false,
    colors: true,
    modules: false
  }
})

app.use(devMiddleware)
app.use(webpackHotMiddleware(compiler))
app.use(history())

logger.info('Starting dev server...')
devMiddleware.waitUntilValid(() => {
  app.use('*', (req, res) => {
    res.set('Content-Type', 'text/html')
    res.send(devMiddleware.fileSystem.readFileSync(path.resolve(config.output, 'index.html')))
  })
  app.listen(port)
  logger.info(`🚀 Application started, listening at on port ${port}`)
})

let blocks = []
// Broadcast to everyone else.
wss.broadcast = (ws, message) => {
  wss.clients.forEach(client => {
    // client !== ws &&
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      const data = {
        type: 'patch',
        data: message
      }
      client.send(JSON.stringify(data))
    }
  })
}

wss.on('connection', ws => {
  ws.on('message', message => {
    console.log('received: %s', message)
    blocks.push(message)
    wss.broadcast(ws, message)
    ws.send(RESPONSE_ACK)
  })
  const data = {
    type: 'blocks',
    data: blocks
  }
  ws.send(JSON.stringify(data))
})
