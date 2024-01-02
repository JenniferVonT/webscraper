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
   */
  async checkForAvailibleDate (urls) {
    const amount = urls.length

    for (let i = 0; i < amount; i++) {
      const response = await axios.get(urls[i])

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const html = response.data
      const dom = cheerio.load(html)

      // Gather the name on the calendar, the days and corresponding availablility.
      const availableDates = []
      const name = dom('h2').text()

      const days = dom('th')
      const available = dom('td')

      // Put everything together into an object.
      days.each((dayIndex, dayElement) => {
        const day = dom(dayElement).text()
        const correspondingIsOK = available.eq(dayIndex)
        const isOK = correspondingIsOK.text().trim().toLowerCase() === 'ok'

        availableDates.push({ name, day, isOK })
      })

      console.log(availableDates[0])
    }
  }
}
