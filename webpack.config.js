const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const port = process.env.PORT || 3000;

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: "./src/js/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  devServer: {
    port,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
      favicon: "src/img/global/icons/favicon.ico",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.svg$/,
        use: ["svg-inline-loader"],
      },
      {
        test: /\.(eot|woff|ttf)$/,
        use: ["file-loader"],
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(__dirname, "src"),
      "node_modules",
    ],
    extensions: [".js", ".jsx"],
  },
};
