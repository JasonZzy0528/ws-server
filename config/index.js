import path from 'path'
import pkg from '../package.json'
import { includes } from 'lodash'

const pkgDeps = pkg.dependencies
let staticPkgs = []
let staticDeps = ['ckeditor']

staticDeps.forEach(function(key) {
  if (includes(staticDeps, key)) {
    const version = pkgDeps[key]
    staticPkgs.push({
      from: path.resolve(__dirname, '../node_modules/' + key),
      to: 'static/js/' + key + '/' + version + '/'
    })
  }
})

const config = {
  client: path.resolve(__dirname, '..', 'client'),
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: ['babel-polyfill', path.resolve(__dirname, '..', 'client', 'index.js')]
  },
  staticPkgs,
  output: path.resolve(__dirname, '..', 'dist'),
  template: path.resolve(__dirname, '..', 'client', 'template', 'index.html'),
  wsport: 8080,
  port: 3000
}

export default config
