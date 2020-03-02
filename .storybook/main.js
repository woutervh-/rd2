const path = require('path');

module.exports = {
    stories: ['../**/*.stories.tsx'],
    addons: ['@storybook/addon-storysource'],
    webpackFinal: async (config) => {
        config.resolve.extensions.push('.ts', '.tsx', '.json');
        config.module.rules = [];
        config.module.rules.push(
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: require.resolve('ts-loader'),
                        options: {
                            configFile: 'tsconfig.json'
                        }
                    }
                ]
            },
            {
                test: /\.json$/,
                type: 'javascript/auto',
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: process.env.NODE_ENV === 'production'
                                ? '[name].[hash].[ext]'
                                : '[name].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.stories\.tsx?$/,
                loaders: [
                    {
                        loader: require.resolve('@storybook/source-loader'),
                        options: {
                            parser: 'typescript'
                        }
                    }
                ],
                enforce: 'pre',
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                mode: 'local',
                                localIdentName: '[path][name]__[local]--[hash:base64:5]'
                            }
                        }
                    },
                    'sass-loader'
                ],
            }
        );
        return config;
    }
};
