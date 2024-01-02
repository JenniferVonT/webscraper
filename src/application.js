/**
 * The application module.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import { readFile, writeFile } from 'node:fs/promises'
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
   * The restaurant URL.
   */
  #restaurantURL

  /**
   * The calendar URL.
   */
  #calendarURL

  /**
   * The movie URL.
   */
  #movieURL

  /**
   * Initiates the class.
   *
   * @param {string} url - The url to begin the scraping.
   */
  constructor (url) {
    this.#url = url
    this.#restaurantURL = ''
    this.#calendarURL = ''
    this.#movieURL = ''
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
    const linkScraper = new LinkScraper()
    linkScraper.extractLinks(this.#url)
  }
}
