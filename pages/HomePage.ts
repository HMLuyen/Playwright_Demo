import { BasePage } from './BasePage'

export class HomePage extends BasePage {
  async goto(): Promise<void> {
    await this.navigateTo('/', 'Go to home page')
  }
}
