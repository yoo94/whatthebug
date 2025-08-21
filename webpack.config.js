const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: './src/popup.js'
  },
  output: {
    filename: 'src/[name].js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
  mode: 'production',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'src/popup.html', to: 'src/popup.html' },
        { from: 'src/error.json', to: 'src/error.json' },
        { from: 'icons/**/*', to: 'icons/[name][ext]' },
      ],
    }),
  ],
};
