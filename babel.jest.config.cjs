// Used by Jest only (passed explicitly in jest.config.cjs), so Vite's build is unaffected.
module.exports = {
    presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/preset-react", { runtime: "automatic" }],
        "@babel/preset-typescript"
    ]
};
