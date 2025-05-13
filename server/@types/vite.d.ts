// Type augmentation for Vite to fix TypeScript errors
// without modifying the original source files

declare module 'vite' {
  export interface ServerOptions {
    // Allow boolean as a valid type for allowedHosts
    allowedHosts?: boolean | true | string[] | undefined;
  }
}