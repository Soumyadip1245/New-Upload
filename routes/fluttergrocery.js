const router = require('express').Router()
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
async function getZeptoUrl(searchQuery) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}+site:zeptonow.com`);

    const searchResults = await page.$$eval('div.g', results => {
        return results.map(result => {
            const linkElement = result.querySelector('a');
            const link = linkElement.getAttribute('href');
            return link.startsWith('/url?') ? new URLSearchParams(link.substring(5)).get('q') : link;
        });
    });

    await browser.close();

    const zeptoUrl = searchResults.find(result => result.startsWith('https://www.zeptonow.com/'));
    return zeptoUrl;
}
async function getBigBasketUrl(searchQuery) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}+site:bigbasket.com`);

    const searchResults = await page.$$eval('div.g', results => {
        return results.map(result => {
            const linkElement = result.querySelector('a');
            const link = linkElement.getAttribute('href');
            return link.startsWith('/url?') ? new URLSearchParams(link.substring(5)).get('q') : link;
        });
    });

    await browser.close();

    const bigBasketUrl = searchResults.find(result => result.startsWith('https://www.bigbasket.com/'));
    return bigBasketUrl;
}

router.post('/grocery', async (req, res) => {
    var searchQuery = req.body.searchQuery
    const zeptoUrl = await getZeptoUrl(searchQuery);
    const browserzepto = await puppeteer.launch();
    const pagezepto = await browserzepto.newPage();
    await pagezepto.goto(zeptoUrl);
    const priceElement = await pagezepto.$('h4.block.font-lato.Md1FKI.sm\\:\\!text-\\[1\\.5rem\\]');
    const nameElement = await pagezepto.$('h1.block.font-lato.XUM3wW.\\!text-\\[1\\.25rem\\].\\!leading-\\[1\\.5rem\\].\\!tracking-normal');
    const pricezepto = await priceElement.evaluate(element => element.textContent.trim());
    const namezepto = await nameElement.evaluate(element => element.textContent.trim());
    await browserzepto.close();

    const bigBasketUrl = await getBigBasketUrl(searchQuery);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(bigBasketUrl);
    const bigbasketpriceElement = await page.$('td.IyLvo');
    const bigbasketnameElement = await page.$('h1.GrE04');
    const bigbasketprice = await bigbasketpriceElement.evaluate(element => element.textContent.trim());
    const bigbasketname = await bigbasketnameElement.evaluate(element => element.textContent.trim());

    res.json({
        "success": true,
        products: [
            {
                "title": bigbasketname,
                "price": bigbasketprice,
                "from": "Bigbasket"
            }, {
                "title": namezepto,
                "price": pricezepto,
                "from": "Zepto"
            }
        ]

    })
    await browser.close();

})
module.exports = router;
