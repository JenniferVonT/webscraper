/**
 * The restaurant handling module.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

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

    // Send a post request to the page with the form data and headers.
    const loginResponse = await axios.post(`${url}login`, {
      username: 'zeke',
      password: 'coys',
      submit: 'login'
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxRedirects: 0,
      manualRedirect: true
    })

    if (loginResponse.status !== 302) {
      throw new Error('Login failed! Status:', loginResponse.status)
    }

    // Get the session cookie from the response headers.
    const sessionCookie = loginResponse.headers['set-cookie']

    const redirectURL = loginResponse.headers.location

    const redirectResponse = await axios.get(`${url}${redirectURL}`, {
      headers: {
        Cookie: sessionCookie
      }
    })

    if (redirectResponse.status !== 200) {
      throw new Error(`Redirect error: ${loginResponse.status}`)
    }

    console.log('Response Status:', redirectResponse.status)
    console.log('Response Headers:', redirectResponse.headers)

    const html = redirectResponse.data
    const dom = cheerio.load(html)

    // Get all friday data.
    const div = dom('div.WordSection2')
    const spanElement = div.find('span')
  }
}
