/**
 * The application module.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import validator from 'validator'
import { LinkScraper } from './link-scraper.js'
import { CalendarHandler } from './calender-handler.js'
import { MovieHandler } from './movie-handler.js'
import { RestaurantHandler } from './restaurant-handler.js'

/**
 * Encapsulates a Node application.
 */
export class Application {
  /**
   * The URL to scrape.
   */
  #url

  /**
   * Initiates the class.
   *
   * @param {string} url - The url to begin the scraping.
   */
  constructor (url) {
    // Validate if the argument is empty or if it follows correct URL syntax.
    if (url.length === 0 || !validator.isURL(url)) {
      throw new Error('not a URL.')
    }

    this.#url = url
  }

  /**
   * Gets the current URL.
   *
   * @returns {string} The url to begin the scraping with.
   */
  get url () {
    return this.#url
  }

  /**
   * Sets the URL to scrape.
   *
   * @param {string} argument - The new URL to scrape.
   */
  set url (argument) {
    // Validate if the argument is empty or if it follows correct URL syntax.
    if (argument.length === 0 || !validator.isURL(argument)) {
      throw new Error('not a URL.')
    }

    this.#url = argument
  }

  /**
   * Begins the application.
   *
   * @returns {string} - If it can't find an available day for everyone it returns a message about it.
   */
  async run () {
    process.stdout.write('Scraping links...')

    // Get the initial links on the starting site.
    const linkScraper = new LinkScraper()
    const initialLinks = await linkScraper.extractLinks(this.#url)

    console.log('OK') // Link scraping complete.

    // Get the correct URLs for the different sites.
    const calendarURL = initialLinks.find(url => /calendar/.test(url))
    const movieURL = initialLinks.find(url => /cinema/.test(url))
    const restaurantURL = initialLinks.find(url => /dinner/.test(url))

    process.stdout.write('Scraping available days...')

    // Get all the calendars links (relative paths) and make them absoulte paths.
    const calendars = await linkScraper.extractLinks(calendarURL)

    // Concatenate them with the absolute path to get absolute URLs.
    const absoluteCalendarLinks = calendars.map(relativeLink => {
      return `${calendarURL}${relativeLink.slice(2)}`
    })

    // Check for available days!
    const calenderHandler = new CalendarHandler()

    const availableDays = await calenderHandler.checkForAvailableDate(absoluteCalendarLinks)

    console.log('OK') // Checking for available days complete.

    // Check if there is any matches on the calendars (if there isn't, availableDays should be a string).
    // And return the console.log telling the user that escapes the rest of the method.
    if (!Array.isArray(availableDays)) {
      return console.log('\x1b[31m%s\x1b[0m', '\n==== There was no available days where all of you could meet! ====')
    }

    // Create a new instance of the movie handler.
    const movieHandler = new MovieHandler()
    const movies = []

    process.stdout.write('Scraping showtimes...')

    // Create an array of promises
    const moviePromises = availableDays.map((day) => movieHandler.availableMovies(day, movieURL))

    // Resolve all promises before moving on.
    const allMovies = await Promise.all(moviePromises)

    console.log('OK') // Checking for available showtimes complete.

    // Flatten the array of arrays into a single array (the movies constant).
    allMovies.forEach((movie) => {
      movies.push(...movie)
    })

    const restaurantHandler = new RestaurantHandler()
    const dinnerTimes = []

    process.stdout.write('Scraping possible reservations...')

    // Create an array of promises (iterate through everyone to check each movie)
    const dinnerPromises = movies.map((movie) => {
      // Add 2 hours to the movie start time to get the earliest time to book a table.
      const time = parseInt(movie.time.slice(0, 2)) + 2
      return restaurantHandler.checkRestaurantBooking(movie.day, time.toString(), restaurantURL)
    })

    // Resolve all promises before moving on.
    const allDinnerTimes = await Promise.all(dinnerPromises)

    // Save all the available tables in the const dinnerTimes
    allDinnerTimes.forEach((time) => {
      if (typeof time === 'object') {
        dinnerTimes.push(time)
      }
    })

    console.log('OK') // Checking for available showtimes complete.

    // Filter out the movies that don't match the dinner times.
    const matchingMovies = movies.filter(movie => {
      const matchingDay = dinnerTimes.find(time => time.day === movie.day)
      if (matchingDay) {
        const movieTime = parseInt(movie.time.slice(0, 2))
        const dinnerTime = parseInt(matchingDay.time.slice(0, 2)) - 2
        if (movieTime <= dinnerTime) {
          return movie
        }
      }
      return false
    })

    // Gather all the data.
    const availableDayPlans = []
    const amount = dinnerTimes.length

    for (let i = 0; i < amount; i++) {
      const plans = {
        day: dinnerTimes[i].day,
        movie: matchingMovies[i].movie,
        movieStart: matchingMovies[i].time,
        dinner: dinnerTimes[i].time
      }
      availableDayPlans.push(plans)
    }

    // If there is a movie/dinner match then present the day plans for those, otherwise send a message informing the user of that!
    if (availableDayPlans.length !== 0) {
      console.log('\n\nSuggestions')
      console.log('\x1b[35m%s\x1b[0m', '===========')

      for (let i = 0; i < amount; i++) {
        process.stdout.write('\x1b[33m*\x1b[0m ')
        process.stdout.write(`On ${availableDayPlans[i].day}, `)
        console.log('\x1b[32m%s\x1b[0m', `"${availableDayPlans[i].movie}"`, `begins at ${availableDayPlans[i].movieStart}, and there is a free table to book between ${availableDayPlans[i].dinner}`)
      }
    } else {
      console.log('\x1b[31m%s\x1b[0m', '\n==== There was no available match for both movies and dinner at Zekes! ====')
    }
  }
}
