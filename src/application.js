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
import { link } from 'node:fs'

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
    if (argument.length === 0 || validator.isURL(argument)) {
      throw new Error('not a URL.')
    }

    this.#url = argument
  }

  /**
   * Begins the application.
   */
  async run () {
    // Get the initial links on the starting site.
    const linkScraper = new LinkScraper()
    const initialLinks = await linkScraper.extractLinks(this.#url)

    // Get the correct URLs for the different sites.
    const calendarURL = initialLinks.find(url => /calendar/.test(url))
    const movieURL = initialLinks.find(url => /cinema/.test(url))
    const restaurantURL = initialLinks.find(url => /dinner/.test(url))

    // Get all the calendars links (relative paths) and make them absoulte paths.
    const calendars = await linkScraper.extractLinks(calendarURL)

    // Concatenate them with the absolute path to get absolute URLs.
    const absoluteCalendarLinks = calendars.map(relativeLink => {
      return `${calendarURL}${relativeLink.slice(2)}`
    })

    const calenderHandler = new CalendarHandler()
    // Check for available days! <------------------------------------!!!!! INSERT CODE UNDER HERE.
    calenderHandler.checkForAvailibleDate(absoluteCalendarLinks)

    const movieHandler = new MovieHandler()
    // Check for available movies! <----------------------------------!!!!! INSERT CODE UNDER HERE.

    const restaurantHandler = new RestaurantHandler()
    // Check for available tables! <----------------------------------!!!!! INSERT CODE UNDER HERE.

    // PRESENT AN APPROPRIATE DAY WITH ALL RELEVANT INFORMATION!
  }
}