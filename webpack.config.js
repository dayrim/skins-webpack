const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ConcatPlugin = require("webpack-concat-plugin");

module.exports = {
  entry: ["./assets/desktop/scripts/scripts.js"],
  output: {
    path: path.resolve("./assets/desktop"),
    filename: "scripts/scripts.pack.js",
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
    new ConcatPlugin({
      // examples
      uglify: false,
      sourceMap: false,
      name: "result",
      outputPath: "path/to/output/",
      fileName: "[name].[hash:8].js",
      filesToConcat: [["scripts/**/*.js", "!**/scripts.min.js"]],
      attributes: {
        async: true
      }
    })
  ]
};
