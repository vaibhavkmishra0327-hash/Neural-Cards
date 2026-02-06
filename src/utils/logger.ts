/**
 * Dev-only Logger Utility
 *
 * All logging is suppressed in production builds.
 * Uses import.meta.env.DEV which is tree-shaken by Vite in production.
 */

const isDev = import.meta.env.DEV;

/* eslint-disable no-console */
export const log = {
  info: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },
};
/* eslint-enable no-console */
