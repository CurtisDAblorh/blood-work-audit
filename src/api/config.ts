export const apiConfig = {
    queryStaleTimes: {
        default: 1000 * 60 * 60 * 3, // 3 hours
        live: 1000, // 1 second
        short: 1000 * 60 * 5, // 5 minutes
        long: 1000 * 60 * 60 * 24 // 24 hours
    }
};
