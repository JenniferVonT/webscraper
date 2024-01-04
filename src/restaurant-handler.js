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
   * @param {string} time - The earliest time you want to book.
   * @param {string} url - The restaurant url.
   * @returns {string[]} - Returns the matching times.
   */
  async checkRestaurantBooking (day, time, url) {
    const matchingDinnerTimes = []

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
        return 'No bookable tables matched that day/time! Try a different time.'
      } else {
        return [day, matchingTimes].flat()
      }
    } catch (error) {
      console.error('Error:', error.message)
    }
  }
}
