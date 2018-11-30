const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MergeIntoSingleFilePlugin = require("webpack-merge-and-include-globally");

module.exports = {
    entry: ["./assets/desktop/scripts/scripts.js"],
    output: {
      path: path.resolve("./dist"),
      filename: "scripts.min.js",
      publicPath: ""
    },
  
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          /* Enable file caching. Default path to cache directory: node_modules/.cache/uglifyjs-webpack-plugin. */
          cache: true,
          /* Use multi-process parallel running to improve the build speed. */
          parallel: true, 
          /* Use source maps to map error message locations to modules (this slows down the compilation). If you use your own minify function please read the minify section for handling source maps correctly. */
          sourceMap: true
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
        },
            {
                test: /\.scss$/,
                use: [  
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].min.css',
                            outputPath: 'styles/',
                            publicPath: ''
                        }
                    },
                    {
                      loader: 'extract-loader'
                    },
                    {
                      loader: 'css-loader',
                    },
                    {
                      loader: 'postcss-loader',
                    },
                    {
                      loader: 'sass-loader',
                      options: {
                          sourceMap: true
                      }
                    }
                ]
            },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
        },
        {
          test: /\.(ttf|eot|woff|woff2)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '/fonts/[name].[ext]'
            }
          }
        },
        {
          test: /\.(ttf|eot|woff|woff2)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '/fonts/[name].[ext]'
            }
          }
        },
        {
          test: /\.(png|jpg|svg|gif)$/,

          use: [
            {
              loader: 'file-loader',
              options: {
                name: '/images/[name].[ext]'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].min.css"
      })
    ]
 
}