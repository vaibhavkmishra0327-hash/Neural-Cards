// Type declarations for Supabase Edge Functions (Deno runtime)
// These declarations allow the IDE to understand Deno-specific APIs
// without installing the full Deno SDK.

declare namespace Deno {
  const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
  };
  function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

// Module declarations for Deno-specific import specifiers
declare module 'npm:hono' {
  export class Hono {
    use(...args: any[]): any;
    get(...args: any[]): any;
    post(...args: any[]): any;
    put(...args: any[]): any;
    delete(...args: any[]): any;
    fetch(req: Request, ...args: any[]): Response | Promise<Response>;
  }
}

declare module 'npm:hono/cors' {
  export function cors(options?: any): any;
}

declare module 'npm:hono/logger' {
  export function logger(): any;
}

declare module 'jsr:@supabase/supabase-js@2' {
  export function createClient(url: string, key: string, options?: any): any;
}

declare module 'jsr:@supabase/supabase-js@2.49.8' {
  export function createClient(url: string, key: string, options?: any): any;
}
