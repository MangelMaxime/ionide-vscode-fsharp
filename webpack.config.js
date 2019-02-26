var path = require("path");

function resolve(filePath) {
    return path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
}

var babelOptions = {
    presets: [
        ["@babel/preset-env", {
            "targets": {
                "node": "10.15.1" // LTS version
            },
            "modules": false,
            // This adds polyfills when needed. Requires core-js dependency.
            // See https://babeljs.io/docs/en/babel-preset-env#usebuiltins
            "useBuiltIns": "usage",
        }]
    ],
    plugins: [
        "@babel/plugin-transform-runtime"
    ]
};

module.exports = (env, options) => {

    // If no mode has been defined, default to `development`
    if (options.mode === undefined)
        options.mode = "development";

    var isProduction = options.mode === "production";
    console.log("Bundling for " + (isProduction ? "production" : "development") + "...");

    return {
        target: 'node',
        devtool: "source-map",
        entry: resolve('./src/Ionide.FSharp.fsproj'),
        output: {
            filename: 'fsharp.js',
            path: resolve('./release'),
            libraryTarget: 'commonjs'
        },
        resolve: {
            // See https://github.com/fable-compiler/Fable/issues/1490
            symlinks: false
        },
        externals: {
            // Who came first the host or the plugin ?
            "vscode": "commonjs vscode",

            // Optional dependencies of ws
            "utf-8-validate": "commonjs utf-8-validate",
            "bufferutil": "commonjs bufferutil"
        },
        module: {
            rules: [
                {
                    test: /\.fs(x|proj)?$/,
                    use: {
                        loader: "fable-loader",
                        options: {
                            babel: babelOptions,
                            define: isProduction ? [] : ["DEBUG"]
                        }
                    }
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: babelOptions
                    },
                }
            ]
        }
    };
};
