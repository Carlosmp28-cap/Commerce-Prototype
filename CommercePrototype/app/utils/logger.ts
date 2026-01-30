/**
 * Simple logger utility that redacts sensitive values (tokens, emails) from
 * logged messages and provides consistent logging helpers.
 */
const REDACT_REPLACERS: Array<{ re: RegExp; repl: string }> = [
  // JSON token fields like "token":"..."
  { re: /"?token"?\s*:\s*"[^"]+"/gi, repl: '"token":"***"' },
  // Bearer tokens in headers
  { re: /Bearer\s+[A-Za-z0-9-._~+/]+=*/gi, repl: "Bearer ***" },
  // Simple email masking
  { re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, repl: "***@***" },
];

function sanitizeMessage(...args: any[]) {
  try {
    const text = args
      .map((a) => {
        if (typeof a === "string") return a;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(" ");

    return REDACT_REPLACERS.reduce(
      (acc, { re, repl }) => acc.replace(re, repl),
      text,
    );
  } catch {
    return args.map((a) => (typeof a === "string" ? a : String(a))).join(" ");
  }
}

const SHOULD_LOG =
  typeof process === "undefined" || process.env?.NODE_ENV !== "test";

export const logger = {
  info: (...args: any[]) => {
    if (!SHOULD_LOG) return;
    // eslint-disable-next-line no-console
    console.info(sanitizeMessage(...args));
  },
  warn: (...args: any[]) => {
    if (!SHOULD_LOG) return;
    // eslint-disable-next-line no-console
    console.warn(sanitizeMessage(...args));
  },
  error: (...args: any[]) => {
    if (!SHOULD_LOG) return;
    // eslint-disable-next-line no-console
    console.error(sanitizeMessage(...args));
  },
};

export default logger;
