import { Router, Request, Response } from "express";
import puppeteer from "puppeteer-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import { scrapeContent } from "../data/scrapeData";

puppeteer.use(stealth())

const router = Router()

router.get("/", async (req: Request, res: Response) => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            '--disable-features=site-per-process'
        ]
    })
    try {
        const result = await scrapeContent(browser)
        res.status(200).json(result)
    } 
    catch (error) {
        console.error("Scraping error:", error)
        res.status(500).json({ error: "Failed to scrape article" })
    }
    finally {
        if (browser) {
            await browser.close()
        }
    }
})

export default router