import { randomUUID } from 'node:crypto'
import { APIRequestContext } from '@playwright/test'

export interface DemoblazeUser {
  username: string
  password: string
}

export interface CartItem {
  id: string
  prod_id: number
}

export interface ProductDetail {
  id: number
  title: string
  price: number
  img: string
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

  /** validate the token */
  async check(token: string): Promise<{ username: string }> {
    const res = await this.request.post(`${this.apiUrl}/check`, { data: { token } })
    const body = await res.json()
    if (body?.errorMessage) {
      throw new Error(`Token check failed: ${body.errorMessage}`)
    }
    return { username: body.Item.username }
  }

  /** add the product to the cart */
  async addToCart(params: { token: string; prodId: number }): Promise<void> {
    const res = await this.request.post(`${this.apiUrl}/addtocart`, {
      data: { id: randomUUID(), cookie: params.token, prod_id: params.prodId, flag: true },
    })
    const body = await res.json()
    if (body?.errorMessage) {
      throw new Error(`addToCart failed: ${body.errorMessage}`)
    }
  }

  /** get the cart items */
  async viewCart(token: string): Promise<CartItem[]> {
    const res = await this.request.post(`${this.apiUrl}/viewcart`, {
      data: { cookie: token, flag: true },
    })
    const body = await res.json()
    if (body?.errorMessage) {
      throw new Error(`viewCart failed: ${body.errorMessage}`)
    }
    return body.Items ?? []
  }

  /** get the product details */
  async viewProduct(prodId: number): Promise<ProductDetail> {
    const res = await this.request.post(`${this.apiUrl}/view`, { data: { id: prodId } })
    return res.json()
  }

  async deleteItem(cartItemId: string): Promise<void> {
    await this.request.post(`${this.apiUrl}/deleteitem`, { data: { id: cartItemId } })
  }

  /** clear the cart */
  async clearCart(username: string): Promise<void> {
    await this.request.post(`${this.apiUrl}/deletecart`, { data: { cookie: username } })
  }

  /** get all the product information */
  async getEntries(): Promise<unknown> {
    const res = await this.request.get(`${this.apiUrl}/entries`)
    return res.json()
  }
}
