// Browser APIs jsdom doesn't provide but the app's components call.

// Media queries (reduced motion, the sidebar's mobile check): always report "no match".
window.matchMedia = (query: string) =>
    ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false
    }) as MediaQueryList;

// jsdom has no layout, so scrolling is a no-op tests can spy on.
Element.prototype.scrollIntoView = () => {};

// CSS.escape (used to find a cited record by ID) exists in every browser but not in jsdom.
if (typeof globalThis.CSS?.escape !== "function") {
    globalThis.CSS = {
        ...globalThis.CSS,
        escape: (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, (char) => `\${char}`)
    } as typeof CSS;
}
