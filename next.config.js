const sassOptions = {
	includePaths: ["./components", "./pages"],
	prependData: `
    @use "sass:math";
    @import "./lib/styles/mediaqueries"; 
    @import "./lib/styles/fonts";
  `,
};

const nextOptions = {
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	devIndicators: {
		buildActivity: false,
	},
	experimental: {
		scrollRestoration: true,
		largePageDataBytes: 5000000,
	},
	webpack: (config, ctx) => {
		config.module.rules.push({
			test: /\.(graphql|gql)$/,
			exclude: /node_modules/,
			loader: "graphql-tag/loader",
		});
		config.resolve.fallback = { fs: false, dns: false, net: false };
		return config;
	},
	async rewrites() {
		return [
			{
				source: "/account/pricelist/download",
				destination: "/api/pricelist",
			},
		];
	},
};

module.exports = { sassOptions, ...nextOptions };
