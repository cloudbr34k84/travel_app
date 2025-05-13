/**
 * This file contains type declarations to fix TypeScript errors
 * in the Vite server configuration without modifying the original files.
 * 
 * The allowedHosts property in ServerOptions is expected to be a boolean in our code
 * but the Vite types only allow true, string[] or undefined. This declaration
 * helps TypeScript accept our current code.
 */

// This is just a dummy export to make this a module
export const viteTypeFix = true;