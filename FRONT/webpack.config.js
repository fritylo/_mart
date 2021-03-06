const path = require('path'),
   webpack = require('webpack'),
   factory = require('./env/webpack.factory'),
   { CleanWebpackPlugin } = require('clean-webpack-plugin'),
   CopyWebpackPlugin = require('copy-webpack-plugin'),
   MiniCssExtractPlugin = require('mini-css-extract-plugin'),
   HtmlBeautyWebpackPlugin = require('beautify-html-webpack-plugin');

const { mode, entries, HtmlWebpackPlugins } = factory({
   pagesSrc: './src/Pages/',
});

console.log(`MODE: ${mode}\n`);

const config = {
   entry: entries, //entry points of project
   output: {
      filename: (pathData, assetInfo) => {
         //console.log('path data:', pathData);

         //console.log('asset info:', assetInfo);
         if (mode == 'development') {
            return '[name]/[name].bundle.js';
         } else {
            return '[name]/[name].[fullhash].js';
         }
      },
      path: path.resolve(__dirname, 'dist'), //target folder
   },
   plugins: [
      //new CleanWebpackPlugin({
      //  cleanOnceBeforeBuildPatterns: ['!./dist/**/index.php', './dist/**/*'], //dist folder clean up
      //}),
      ...HtmlWebpackPlugins,
      new HtmlBeautyWebpackPlugin({
         "indent_size": 4,
         "indent_char": " ",
         "indent_with_tabs": false,
         "editorconfig": false,
         "eol": "\n",
         "end_with_newline": false,
         "indent_level": 0,
         "preserve_newlines": true,
         "max_preserve_newlines": 2,
         "space_in_paren": false,
         "space_in_empty_paren": false,
         "jslint_happy": false,
         "space_after_anon_function": false,
         "space_after_named_function": false,
         "brace_style": "collapse",
         "unindent_chained_methods": false,
         "break_chained_methods": false,
         "keep_array_indentation": true,
         "unescape_strings": false,
         "wrap_line_length": 100,
         "e4x": false,
         "comma_first": false,
         "operator_position": "before-newline",
         "indent_empty_lines": true,
         "templating": ["auto"]
      }),
      new CopyWebpackPlugin({
         patterns: [
            { from: 'src/Attach', to: 'Attach' },
            { from: 'src/Assets', to: 'Assets' },
            { from: 'src/Root', to: './' },
         ],
      }),
      new MiniCssExtractPlugin({ //scss compilation //./dist/index.css
         filename: ({ name }) => {
            if (mode == 'development') {
               return '[name]/[name].bundle.css';
            } else {
               return '[name]/[name].[fullhash].css';
            }
         },
      }),
      new webpack.ProvidePlugin({ //connecting jquery
         $: 'jquery',
         jQuery: 'jquery',
      }),
   ],
   module: {
      rules: [
         {
            test: /\.css$/, //prosessing of sass
            use: [
               'style-loader', //put css text as style tags on page, css won't be applied without it
               {
                  loader: MiniCssExtractPlugin.loader, // store css to files in ./dist
                  options: {
                     //  // only enable hot reloading in development
                     //  hmr: mode === 'development',
                     //  // if hmr does not work, this is a forceful method.
                     //  reloadAll: true,
                     esModule: false, // fix warnings
                  },
               },
               {
                  loader: 'css-loader', //CSS to CommonJS, make possible require and import css files in js files
                  options: {
                     //url: false, //don't resolve url links in css files
                  }
               },
               'postcss-loader', //added to use autoprefixer
            ],
         },
         {
            test: /\.s[ac]ss$/, //prosessing of sass
            use: [
               'style-loader', //put css text as style tags on page, css won't be applied without it
               {
                  loader: MiniCssExtractPlugin.loader, // store css to files in ./dist
                  options: {
                     //  // only enable hot reloading in development
                     //  hmr: mode === 'development',
                     //  // if hmr does not work, this is a forceful method.
                     //  reloadAll: true,
                     esModule: false, // fix warnings
                  },
               },
               {
                  loader: 'css-loader', //CSS to CommonJS, make possible require and import css files in js files
                  options: {
                     //url: false, //don't resolve url links in css files
                  }
               },
               'postcss-loader', //added to use autoprefixer
               'sass-loader', //complie SASS to CSS
            ]
         },
         {
            test: /\.pug$/, //processing pug
            use: {
               loader: 'pug-loader',
               options: {
                  filters: {
                     php(text, options) {
                        return `\n<?php\n${text}?>\n`;
                     }
                  },
               }
            } //HtmlWebpackPlugin use this rule to process .pug files
         },
         {
            test: /\.(png|jpe?g|gif|ttf|svg)$/,
            use: [
               {
                  loader: 'file-loader',
                  options: {
                     name: '[path][name].[ext]',
                     context: path.resolve(__dirname, 'src/Attach'),
                     outputPath: 'Attach',
                     //publicPath: (mode == 'development' ? './../../../Attach/' : '../Attach/'),
                     publicPath: '../Attach/',
                     useRelativePaths: true,
                  },
               },
            ],
         },
      ]
   }
};

const development = {
   devtool: 'inline-source-map', //js debugger
   devServer: {
      contentBase: './dist', //localhost root folder
      open: true, //open in this browser
      host: '0.0.0.0',
   },
   watch: true,
};

const production = {
};

if (mode == 'development') {
   factory.objectMerge(config, development);
   config.module.rules.find(r => (r.test + '') == (/\.pug$/ + '')).use.options.pretty = true;
}
else { // production
   factory.objectMerge(config, production);
   config.module.rules.push({
      test: /\.m?js$/,
      loader: 'babel-loader',
   });
   config.module.rules.find(r => (r.test + '') == (/\.pug$/ + '')).use.options.pretty = false;
   config.plugins.push(new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['./**/*'], //dist folder clean up
   }));
}

factory.exclude(config, ['node_modules', 'dist']);

//console.log(config);

module.exports = config; 