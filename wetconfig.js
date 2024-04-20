module.exports = {
    webpack: (config, { dev, vendor }) => {
        // Perform customizations to webpack config
        config.module.rules = [
            ...config.module.rules,
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            }
        ];

        // Important: return the modified config
        return config;
    },
};