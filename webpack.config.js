const path = require('path')

module.exports = {
  entry: './src/index.js',
  target: 'node',
  mode: 'development',
  optimization: {
    minimize: false,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
}
