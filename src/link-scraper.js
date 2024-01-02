/**
 * The link scraper module.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

/**
 * Encapsulates a link scraper.
 */
export class LinkScraper {

    /**
     * Extract the links from a web page.
     * 
     * @param {string} url - The url to scrape.
     * @returns {string[]} - The unique and absolute links.
     */
    async extractLinks (url) {
        // Get a response object from the url.
        const response = await axios.get(url)

        // Check if it is successfull, if not throw an error.
        if(response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        // Bind the data (html content) from the response and initialize the cheerio function load,
        // to be able to query and manipulate the data.
        const html = response.data
        const dom = cheerio.load(html)

        // Parse for all a-elements with the correct href attribute (i.e all links)
        const allLinks = []
        dom('[href^="http://"], a[href^="https://"]').each((index, element) => {
            const link = dom(element).attr('href')
            allLinks.push(link)
        })

        console.log(allLinks)
        return [...new Set(links)].sort()
    }         
}
