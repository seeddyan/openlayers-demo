const path = require('path');

const webpack = require('webpack');

module.exports = {
    mode: 'production',
    context: __dirname,
    entry: {
        app: './src/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    }
};
