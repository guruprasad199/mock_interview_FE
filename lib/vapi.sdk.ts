import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export function getVapi() {
    const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

    if (!webToken) {
        throw new Error("Missing NEXT_PUBLIC_VAPI_WEB_TOKEN");
    }

    if (!vapiInstance) {
        vapiInstance = new Vapi(webToken);
    }

    return vapiInstance;
}
