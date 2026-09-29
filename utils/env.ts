/** Single source for config read from process.env — overridden directly via shell/CI environment variables */
export const BASE_URL = process.env.BASE_URL ?? 'https://www.demoblaze.com'
export const API_URL = process.env.API_URL ?? 'https://api.demoblaze.com'
