/**
 * The restaurant handling module.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

/**
 * Handles data from a restaurant web page.
 */
export class RestaurantHandler {
  /**
   * Checks if there is any free tables during a certain day/time.
   *
   * @param {string} day - What day do you want to book.
   * @param {string} time - What's the earliest time you want to book.
   * @param {string} url - The restaurant url.
   */
  async checkRestaurantBooking (day, time, url) {
    const availableTables = []

    const params = new URLSearchParams()
    params.append('username', 'zeke')
    params.append('password', 'coys')
    params.append('submit', 'login')

    try {
      // Send a POST request with the login data and stop the redirect by setting it to manual.
      const loginResponse = await fetch(`${url}login`, {
        method: 'POST',
        body: params,
        redirect: 'manual',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      // Save the session cookie for the login and the redirect URL.
      const sessionCookie = loginResponse.headers.get('set-cookie')
      const redirectURL = loginResponse.headers.get('location')

      // Send a GET request with the cookie data to get the logged in page.
      const redirectResponse = await fetch(`${url}${redirectURL}`, {
        method: 'GET',
        headers: {
          cookie: sessionCookie
        }
      })

      if (redirectResponse.status !== 200) {
        throw new Error('HTTP error! Status:', redirectResponse.status)
      }

      const html = await redirectResponse.text()
      const dom = cheerio.load(html)
    } catch (error) {
      console.error('Error:', error.message)
    }
  }
}
