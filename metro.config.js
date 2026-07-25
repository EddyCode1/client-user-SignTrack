const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const ZUSTAND_MODULES = new Set([
    "zustand",
    "zustand/middleware",
    "zustand/vanilla",
    "zustand/shallow",
    "zustand/traditional",
]);

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (ZUSTAND_MODULES.has(moduleName)) {
        return {
            filePath: require.resolve(moduleName),
            type: "sourceFile",
        };
    }

    if (defaultResolveRequest) {
        return defaultResolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
