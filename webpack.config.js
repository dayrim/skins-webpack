const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MergeIntoSingleFilePlugin = require("webpack-merge-and-include-globally");

module.exports = {
  entry: ["./assets/desktop/ds.js"],
  output: {
    path: path.resolve("./assets"),
    filename: "desktop/scripts/scripts.mymin.js",
    publicPath: ""
  },

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new MiniCssExtractPlugin({
        filename: "styles/styles.min.css"
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  module: {
    rules: [
      {
        exclude: [/node_modules\/(?!(swiper|dom7)\/).*/, /\.test\.js?$/],
        test: /\.js?$/,
        use: "babel-loader"
      }
      //   {
      //     test: /\.scss$/,
      //     use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
      //   },
      //   {
      //     test: /\.css$/,
      //     use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      //   },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles/styles.min.css"
    }),
    new MergeIntoSingleFilePlugin({
      files: {
        "vendor.js": ["**/scripts/**/*(!(!(*.js)|scripts.min.js))"]
      }
    })
  ]
};
// "scripts/**/*.js", "!**/scripts.min.js"
