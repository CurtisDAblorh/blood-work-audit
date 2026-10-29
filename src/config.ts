// The API is same-origin: /api requests are answered in the browser from public/data (see src/api/staticGateway.ts).
const GATEWAY_URL = "/api";

const config = {
    urls: {
        gateway: {
            general: GATEWAY_URL
        }
    }
};

export default config;
