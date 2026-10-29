export default {
    manifest: {
        get: "/manifest"
    },
    review: {
        get: "/review"
    },
    panel: {
        list: "/panels",
        get: (panelId: string) => `/panels/${encodeURIComponent(panelId)}`
    }
} as const;
