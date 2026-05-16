// Next.js middleware entry point.
// The actual logic lives in proxy.ts; we re-export it here with the
// name that Next.js requires ("middleware") together with the matcher config.
export { proxy as middleware, config } from "./proxy";
