import { Browser, Page, ElementHandle } from "puppeteer"
import fs from 'fs'
import path from 'path'

interface Result {
    title: string
    content: string
}

export async function scrapeContent(browser: Browser) {
    const searchQuery = "trichy murders"
    const url = `https://www.thehindu.com/search/#gsc.tab=0&gsc.q=${searchQuery}&gsc.sort=`

    const page: Page = await browser.newPage()

    await page.setViewport({ width: 1280, height: 800 })

    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; MSIE 11.0; Windows NT 6.1; Win64; x64; en-US) like Gecko",
        "Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0",
        "Mozilla/5.0 (Linux; U; Android 4.2.2; en-us; GT-I9300 Build/JDQ39) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Mobile Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:52.0) Gecko/20100101 Firefox/52.0"
    ]

    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]

    await page.setUserAgent(randomUserAgent)

    await page.goto(url, { timeout: 110000, waitUntil: 'domcontentloaded' })

    const result: Result[] = []

    await page.waitForSelector('div.gsc-cursor-page', { timeout: 110000 })

    let pageElements = await page.$$("div.gsc-cursor-page")

    await page.waitForSelector("div.gsc-resultsbox-visible", { timeout: 110000 })
    
    for(let i = 0; i < pageElements.length; i++){
        
        // Click page element only if it's not the first page
        if(i !== 0){
            const pageElement = pageElements[i]

            try {
                await page.evaluate((el) => {
                    el.click()
                }, pageElement)

                await page.waitForSelector("div.gsc-resultsbox-visible", { timeout: 110000 })

                await new Promise(r => setTimeout(r, 5000))
            } 
            catch (error) {
                console.log("Error clicking page element", error)
            }  
        }

        pageElements = await page.$$("div.gsc-cursor-page")

        // Extract article links from the page
        let elements: ElementHandle<HTMLAnchorElement>[] = await page.$$("div.gsc-resultsbox-visible > div > div div > div.gsc-thumbnail-inside > div > a")

        for (const element of elements) {
            try {
                const link = await page.evaluate((el: HTMLAnchorElement) => el.href, element)
    
                // Open article page and scrape data
                const articlePage = await browser.newPage()
                await articlePage.goto(link, { waitUntil: 'load', timeout: 110000 })
                await articlePage.waitForSelector("h1.title", { timeout: 110000 }).catch(error => { return })

                await new Promise(r => setTimeout(r, 5000))
    
                const title = await articlePage.$eval("h1.title", (element) => element.textContent.trim())
                const body = await articlePage.$$eval("div.articlebodycontent p", (elements) =>
                    elements.map((p) => p.textContent.replace(/\n/g, " ").replace(/\s+/g, " "))
                )

                result.push({ title, content: body.join(" ") })
                await articlePage.close()
            }
            catch (error) {
                console.log("Error extracting article:", error)
            }
        }
    }

    const fileName = searchQuery.split(' ')[0]
    const folderPath = path.join(__dirname, '../', 'scrapedData')

    const filePath = path.join(folderPath, `${fileName}.json`)

    fs.writeFileSync(filePath, JSON.stringify({ searchQuery, length: result.length, result }, null, 2), 'utf-8')

    console.log(`Saved to ${filePath}`)
    return { searchQuery, length: result.length, result }
}