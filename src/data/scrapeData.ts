import { Browser, ElementHandle } from "puppeteer"
import fs from 'fs'
import path from 'path'

interface Result {
    title: string
    content: string
}

export async function scrapeContent(browser: Browser) {
    const searchQuery = "trichy murders"
    const url = `https://www.thehindu.com/search/#gsc.tab=0&gsc.q=${searchQuery}&gsc.sort=`

    const page = await browser.newPage()

    await page.setViewport({ width: 1280, height: 800 })

    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"
    ]

    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]

    await page.setUserAgent(randomUserAgent)

    await page.goto(url, { timeout: 90000 })

    const result: Result[] = []

    await page.waitForSelector('div.gsc-cursor-page', { timeout: 90000 })

    let pageElements = await page.$$("div.gsc-cursor-page")

    await page.waitForSelector("div.gsc-resultsbox-visible", { timeout: 90000 })
    
    for(let i = 0; i < pageElements.length; i++){
        
        // Click page element only if it's not the first page
        if(i !== 0){
            const pageElement = pageElements[i]

            await page.evaluate((el) => {
                el.click()
            }, pageElement)
            
            // Wait for content to load after page navigation
            await page.waitForSelector("div.gsc-resultsbox-visible", { timeout: 90000 })

        }

        // Extract article links from the page
        let elements: ElementHandle<HTMLAnchorElement>[] = await page.$$("div.gsc-resultsbox-visible > div > div div > div.gsc-thumbnail-inside > div > a")

        for (const element of elements) {
            try {
                const link = await page.evaluate((el: HTMLAnchorElement) => el.href, element)
    
                // Open article page and scrape data
                const articlePage = await browser.newPage()
                await articlePage.goto(link, { waitUntil: 'load', timeout: 90000 })
                await articlePage.waitForSelector("h1.title", { timeout: 90000 })
    
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
    const folderPath = path.join(__dirname, 'src', 'scrapedData')

    const filePath = path.join(folderPath, `${fileName}.json`)

    fs.writeFileSync(filePath, JSON.stringify({ searchQuery, length: result.length, result }, null, 2), 'utf-8')

    console.log(`Saved to ${filePath}`)
    return { searchQuery, length: result.length, result }
}