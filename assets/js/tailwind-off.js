/* 作品集不使用 Tailwind；此文件用于替换 PageForge 默认注入的 Tailwind CDN 脚本，
   避免 Tailwind 的 preflight 重置覆盖自定义排版。 */
window.tailwind = window.tailwind || { config: {} };
