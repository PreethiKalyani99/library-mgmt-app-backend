import { Browser, Page, ElementHandle } from "puppeteer"

interface ResultProp {
    title: string
    content: string
}

async function navigateToNextPage(currentPage: number, page: Page) {
    const nextPageIndex = currentPage - 1
    const pageElements: ElementHandle<Element>[] = await page.$$('div.gsc-cursor-page')

    if (!pageElements[nextPageIndex]) {
        console.log("No more pages to navigate.")
        return false
    }

    await pageElements[nextPageIndex].click()
    await page.waitForSelector('div.gsc-resultsbox-visible', { timeout: 10000 })

    return true
}

export async function scrapeContent(browser: Browser) {
    const searchQuery = "crimes"
    const url = `https://www.thehindu.com/search/#gsc.tab=0&gsc.q=${searchQuery}&gsc.sort=`

    const page = await browser.newPage()

    await page.setViewport({ width: 1280, height: 800 })
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
    await page.goto(url, { timeout: 90000 })

    await page.waitForSelector("div.gsc-resultsbox-visible")

    // const totalPages: string[] = await page.$$eval('div.gsc-cursor-page', (divs: HTMLDivElement[]) => {
    //     return divs.map((div) => div.textContent.trim())
    // })

    const result: ResultProp[] = []
    let currentPage = 1
    const lastPage = 10
    const visitedElements = new Set<string>()

    while (currentPage <= lastPage) {
        await page.waitForSelector("div.gsc-resultsbox-visible")

        let elements: ElementHandle<HTMLAnchorElement>[] = await page.$$("div.gsc-webResult.gsc-result a")

        for (const element of elements) {
            try {
                const link = await page.evaluate((el: HTMLAnchorElement) => el.href, element)
                
                if (visitedElements.has(link)) continue

                visitedElements.add(link)
    
                const articlePage = await browser.newPage()
                await articlePage.goto(link, { waitUntil: 'load', timeout: 60000 })
                await articlePage.waitForSelector("h1.title")
    
                const title = await articlePage.$eval("h1.title", (element) => element.textContent.trim())
                const body = await articlePage.$$eval("div.articlebodycontent p", (elements) =>
                    elements.map((p) => p.textContent.replace(/\n/g, " ").replace(/\s+/g, " "))
                )
                result.push({ title, content: body.join(" ") })
    
                await articlePage.close()
            } catch (error) {
                console.log("Error extracting article:", error)
            }
        }
        const nextPageNavigation = await navigateToNextPage(currentPage + 1, page)
        
        if(!nextPageNavigation){
            break
        }
        currentPage ++

    }
    return { searchQuery, length: result.length, result }
}