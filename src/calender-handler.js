/**
 * The calendar handling module.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

/**
 * Handles the data from scraping a calendar web page.
 */
export class CalendarHandler {
  /**
   * Scrape web pages for eventual available date(s) in a calendar.
   *
   * @param {string} urls - The url to scrape.
   * @returns {string[]} - The day(s) that are available for all calendars.
   */
  async checkForAvailableDate (urls) {
    const amount = urls.length
    const availableDates = []

    for (let i = 0; i < amount; i++) {
      const response = await axios.get(urls[i])

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const html = response.data
      const dom = cheerio.load(html)

      // Gather the name on the calendar, the days and corresponding availablility.
      const name = dom('h2').text()

      const days = dom('th')
      const available = dom('td')

      // Put everything together into an object.
      days.each((dayIndex, dayElement) => {
        const day = dom(dayElement).text()
        const correspondingIsOK = available.eq(dayIndex)
        const isOK = correspondingIsOK.text().trim().toLowerCase() === 'ok'

        // Only save the days that are available.
        if (isOK) {
          availableDates.push({ name, day, isOK })
        }
      })
    }

    // Filter out who's available on what day.
    const friday = availableDates
      .filter((obj) => obj.day === 'Friday')
      .map(obj => obj.name)

    const saturday = availableDates
      .filter((obj) => obj.day === 'Saturday')
      .map(obj => obj.name)

    const sunday = availableDates
      .filter((obj) => obj.day === 'Sunday')
      .map(obj => obj.name)

    const match = []

    // Check how many are available on what day, if all calendars has an opening on that day save it.
    if (friday.length === amount) {
      match.push('Friday')
    }
    if (saturday.length === amount) {
      match.push('Saturday')
    }
    if (sunday.length === amount) {
      match.push('Sunday')
    }

    return match
  }
}
