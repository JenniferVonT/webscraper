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
   * @returns {Array} - An array of objects with all movies and their start time available.
   */
  async availableMovies (day, url) {
    // Get the initial page.
    const response = await axios.get(url)

    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const html = response.data
    const dom = cheerio.load(html)

    // Get the select element for the day form.
    const selectDay = dom('select[id="day"]')
    // Get the value for the correct day.
    const dayValue = selectDay.find(`option:contains(${day})`).val()

    // Get all the values for the movies.
    const selectMovie = dom('select[id="movie"]')
    const movieOptions = selectMovie.find('option[value]')
    const movieValues = movieOptions.map((index, element) => dom(element).val()).get()

    // Create an empty array where all the movie data can go later.
    const finalMovieInfo = []

    // Start iterating through the movies.
    for (let i = 0; i < movieValues.length; i++) {
      // Make a request for each movie, sending the values for day and movie.
      const movieResponse = await axios.get(`${url}/check`, {
        params: {
          day: dayValue,
          movie: movieValues[i]
        }
      })

      // Get the response object from the request.
      const responseData = movieResponse.data

      // Filter out so only the objects with status 1 in them is left (the ones available).
      const allMovies = responseData.filter(item => item.status === 1)

      // Get the movie name.
      const movieName = dom(`option[value=${movieValues[i]}]`).text()

      // Gather all movie info to be returned, day, time and name.
      allMovies.forEach(movie => {
        const movieInfo = {
          day,
          time: movie.time,
          movie: movieName
        }

        finalMovieInfo.push(movieInfo)
      })
    }

    return finalMovieInfo
  }
}
