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
   * @param {number} time - What's the earliest time you want to book.
   * @param {string} url - The restaurant url.
   */
  async checkRestaurantBooking (day, time, url) {
    const availableTables = []

    // Send a post request to the page with username and password
    const loginResponse = await axios.post(`${url}login`, {
      param: {
        username: 'zeke',
        password: 'coys',
        submit: 'login'
      }
    })

    if (loginResponse.status !== 302) {
      throw new Error(`Login failed! Status: ${loginResponse.status}`)
    }

    // Get the session cookie from the response headers.
    const sessionCookie = loginResponse.headers['set-cookie']

    // Save it to axios for convenience.
    axios.defaults.headers.common.Cookie = sessionCookie

    const bookingResponse = await axios.get(`${url}/login/booking`)

    const html = bookingResponse.data
    const dom = cheerio.load(html)

    console.log(dom.text())
  }
}
