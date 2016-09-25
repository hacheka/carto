var config = {
  context: __dirname,
  entry: "./js/app.js",
  output: {
      path: __dirname + '/output',
      filename: "bundle.js"
  },
  module: {
      loaders: []
  },
  plugins: [],
  devtool: "source-map"
};

module.exports = config;