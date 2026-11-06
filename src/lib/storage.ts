// Platform fallback for tools and environments without native module runners (e.g. Node tests, SSR)
// Metro automatically prioritizes storage.native.ts on Android/iOS and storage.web.ts on Web
export { platformStorage } from "./storage.web";
