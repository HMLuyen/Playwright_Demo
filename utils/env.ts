/** Single source for config read from process.env — set directly (shell/CI) */
export const BASE_URL = process.env.BASE_URL ?? 'https://www.demoblaze.com'
export const API_URL = process.env.API_URL ?? 'https://api.demoblaze.com'
