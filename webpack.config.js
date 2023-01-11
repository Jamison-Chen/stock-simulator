const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: {
        main: "./docs/main.ts",
        basic: "./docs/basic/app.ts",
        pro: "./docs/pro/app.ts",
    },
    output: {
        path: path.resolve(__dirname, "./dist/docs"),
        filename: "js/[name].bundle.js",
        assetModuleFilename: "assets/[hash][ext][query]",
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: "style",
                    test: /\.css$/,
                    chunks: "all",
                    enforce: true,
                },
            },
        },
        minimizer: [
            new TerserPlugin(),
            new CssMinimizerPlugin(),
            new HtmlMinimizerPlugin(),
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".scss"],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/[name].bundle.css",
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: { loader: "ts-loader" },
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader" },
                    { loader: "sass-loader" },
                ],
            },
            {
                test: /\.(png|ico)$/,
                type: "asset/resource",
            },
            {
                test: /\.html/,
                type: "asset/resource",
                generator: {
                    filename: "../[path]/[name][ext][query]",
                },
            },
        ],
    },
};
