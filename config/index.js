import path from 'path'

const config = {
  client: path.resolve(__dirname, '..', 'client'),
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: path.resolve(__dirname, '..', 'client', 'index.js')
  },
  output: path.resolve(__dirname, '..', 'dist'),
  template: path.resolve(__dirname, '..', 'client', 'template', 'index.html')
}

export default config
