/**
 * The movie theatre handling module.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

/**
 * Handles the data from a movie-theatre web page.
 */
export class MovieHandler {
  /**
   * Check what movies are available and during what time on a specific day.
   *
   * @param {string} day - The day to check available movies on.
   * @param {string} url - The page to check movies on.
   * @return {Object} - An object with all movies and their start time available.
   */
  async availableMovies (day, url) {
    // Get the initial page.
    const response = await axios.get(url)

    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const html = response.data
    const dom = cheerio.load(html)

    // Get all the form elements and the submit button.
    const selectDay = dom('form[action="cinema/day"]')
    const selectMovie = dom('form[action="cinema/movie"]')
    const submitButton = dom('button[id="check"]')

  }
}
