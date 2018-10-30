import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import merge from 'webpack-merge'
import webpack from 'webpack'

import baseWebpackConfig from './conf.base'
import config from '../config'

const devConf = merge(baseWebpackConfig, {
  mode: 'development',
  devtool: config.devtool,
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: config.template,
      inject: true
    }),
    new webpack.NamedModulesPlugin(),
    new CopyWebpackPlugin(config.staticPkgs)
  ]
})
export default devConf
