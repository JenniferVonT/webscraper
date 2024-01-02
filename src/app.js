/**
 * The starting point of the application.
 *
 * @author Jennifer von Trotta-Treyden <jv222th@student.lnu.se>
 * @version 1.0.0
 */

import { Application } from './application.js'

try {
    // Get the command prompts from the command-line (skip the first two) 
    const [,, url] = process.argv

    const application = new Application(url)
    await application.run()

} catch (error) {
    console.error(error.message)
}