import { Router, Request, Response } from "express";
import puppeteer from "puppeteer-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import { scrapeContent } from "../data/scrapeData";
import { getAddress } from "../data/addressData";

puppeteer.use(stealth())

const router = Router()

router.get("/", async (req: Request, res: Response) => {
    const browser = await puppeteer.launch({
        // headless: false,
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
        await browser.close()
    }
})

router.get("/addr", async (req: Request, res: Response) => {
    const text = "A daring gold heist took place at Shree Lakshmi Jewelers on MG Road, Bengaluru, late Monday night. According to police officials, a group of masked burglars broke into the store around 2:30 AM and made away with gold and diamond jewelry worth over ₹5 crore. CCTV footage revealed that the suspects arrived in a black SUV, which was later seen speeding towards Electronic City via Bannerghatta Road. The police suspect that the gang might have connections to Chennai and could be planning an escape towards Hosur. 'We have intensified security checks at all major highways, including NH-44, leading towards Tamil Nadu. The suspects seem to be professionals, and we are coordinating with law enforcement agencies in Mysuru and Coimbatore to track them down,' said ACP Ramesh Kumar of the Bengaluru Crime Branch. This incident marks the third major jewelry store robbery in the city within the last six months. Police urge citizens and shop owners in areas like Indiranagar, Jayanagar, and Whitefield to remain vigilant."
    try {
        const result = await getAddress(text)
        res.status(200).json(result)
    } 
    catch (error) {
        console.error("Scraping error:", error)
        res.status(500).json({ error: "Failed to scrape article" })
    }
})

export default router