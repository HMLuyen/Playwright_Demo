import { APIRequestContext } from '@playwright/test'

export interface DemoblazeUser {
  username: string
  password: string
}

/**
 * Wrapper over api.demoblaze.com,
 */
export class DemoblazeClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly apiUrl: string,
  ) {}

  /** encode the password to base64 for login. */
  private encodePassword(password: string): string {
    return Buffer.from(password, 'utf-8').toString('base64')
  }

  /** Signup for the user and ignore "This user already exist." so setup can call this freely. */
  async signup(user: DemoblazeUser): Promise<void> {
    const res = await this.request.post(`${this.apiUrl}/signup`, {
      data: { username: user.username, password: this.encodePassword(user.password) },
    })
    const body = await res.json()
    if (body?.errorMessage && body.errorMessage !== 'This user already exist.') {
      throw new Error(`Signup failed for ${user.username}: ${body.errorMessage}`)
    }
  }

  /**
   * Login for the user and return the token.
   */
  async login(user: DemoblazeUser): Promise<string> {
    const res = await this.request.post(`${this.apiUrl}/login`, {
      data: { username: user.username, password: this.encodePassword(user.password) },
    })
    const body = await res.json()
    if (typeof body === 'string') {
      return body.replace('Auth_token: ', '')
    }
    throw new Error(`Login failed for ${user.username}: ${body?.errorMessage ?? 'unknown error'}`)
  }

  /** clear the cart */
  async clearCart(username: string): Promise<void> {
    await this.request.post(`${this.apiUrl}/deletecart`, { data: { cookie: username } })
  }
}
