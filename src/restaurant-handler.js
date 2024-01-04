/**
 * The restaurant handling module.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import axios from 'axios'
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
      const loginResponse = await fetch(`${url}login`, {
        method: 'POST',
        body: params,
        redirect: 'manual',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      console.log(loginResponse.headers.raw())
      console.log(loginResponse.status)

      const sessionCookie = loginResponse.headers.get('set-cookie')

      const redirectResponse = await fetch(`${url}login/booking`, {
        method: 'GET',
        headers: {
          cookie: sessionCookie
        }
      })

      console.log(redirectResponse.status)
    } catch (error) {
      console.error('Error:', error.message)
    }
  }
}
