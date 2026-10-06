/**
 * 极简前端日志工具。
 * 统一出口,便于将来接入上报或按环境开关。
 */
const isDev = import.meta.env.DEV;

export const logger = {
  error: (...args: unknown[]) => {
    console.error('[app]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[app]', ...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info('[app]', ...args);
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug('[app]', ...args);
  },
};

export default logger;
