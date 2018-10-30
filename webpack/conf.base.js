import config from '../config'

const { entry, output } = config
const baseWebpackConfig = {
  entry,
  output: {
    filename: 'js/[id].bundle.js',
    path: output,
    publicPath: '/',
    sourceMapFilename: 'source-map/[filebase].map'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader'
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif|woff|woff2|icon|eot|svg|ttf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100000
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      bower_components: '../client/bower_components'
    }
  }
}

export default baseWebpackConfig
