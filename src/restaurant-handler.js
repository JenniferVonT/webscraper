/**
 * The restaurant handling module.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { CookieJar, Cookie } from 'tough-cookie'

/**
 * Handles data from a restaurant web page.
 */
export class RestaurantHandler {
  /**
   * Represents a cookie jar.
   */
  #cookieJar

  /**
   * Represents the booking url.
   */
  #bookingURL

  /**
   * Creates an instance of the class.
   */
  constructor () {
    this.#cookieJar = new CookieJar()
    this.#bookingURL = ''
  }

  /**
   * Checks if there is any free tables during a certain day/time.
   *
   * @param {string} day - What day do you want to book.
   * @param {string} time - The earliest time you want to book in a 24h clock syntax, example: 18:00.
   * @param {string} url - The restaurant url.
   * @returns {string[]} - Returns the matching times.
   */
  async checkRestaurantBooking (day, time, url) {
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

      // Save the session cookie in a cookie jar and the redirect URL.
      const redirectURL = loginResponse.headers.get('location')
      this.#bookingURL = `${url}${redirectURL}`
      const sessionCookieValue = loginResponse.headers.get('set-cookie')
      const cookie = Cookie.parse(`dinnerCookie=${sessionCookieValue}`)
      this.#cookieJar.setCookie(cookie, this.#bookingURL)

      // Send a GET request with the cookie data to get the logged in page.
      const redirectResponse = await fetch(this.#bookingURL, {
        method: 'GET',
        headers: {
          cookie: sessionCookieValue
        }
      })

      if (redirectResponse.status !== 200) {
        throw new Error('HTTP error! Status:', redirectResponse.status)
      }

      const html = await redirectResponse.text()
      const dom = cheerio.load(html)

      // Get all the input elements with the attribute 'name' with the value 'group1'.
      // After that get all the value attributes for each element.
      const allAvailableTimes = dom('input[name="group1"]')
      const values = allAvailableTimes.map((index, element) => {
        return dom(element).attr('value')
      }).get()

      // Get the day you want to match and make it fit the same syntax as the value.
      const dayToBook = day.toLocaleLowerCase().slice(0, 3)

      // Filter so that the only values left are the matching days.
      const matchingDays = values.filter(value => {
        return value.startsWith(dayToBook)
      })

      // Get the time you want to match.
      const timeToBook = time.slice(0, 2)

      // Filter so that only the times that are the same or later are left.
      const matchingTimes = matchingDays.filter(value => {
        const timePart = value.slice(3, 5)
        return parseInt(timePart) >= parseInt(timeToBook)
      })
        .map(value => {
          const justTheTime = value.slice(3)
          return `${justTheTime.slice(0, 2)}:00-${justTheTime.slice(2)}:00`
        })

      // Return the result based on if a match was made.
      if (matchingDays.length === 0) {
        return 'No bookable tables matched that day!'
      } else if (matchingTimes.length === 0) {
        return 'No bookable tables matched that time of day'
      } else {
        return { day, time: matchingTimes.toString() }
      }
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  async bookTable (day, time, url) {

  }
}
