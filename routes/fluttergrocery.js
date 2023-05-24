const router = require('express').Router();
const axios = require('axios');
const cheerio = require('cheerio');
router.post('/a', async (req, res) => {
    const searchQuery = req.body.searchQuery;

    try {
        // const zeptoProducts = await scrapeZepto(searchQuery);
        let bigbasketProducts = await scrapeBigbasket(searchQuery);
        const mergedList = zeptoProducts.concat(bigbasketProducts)
        // const sortedData = sortProductsByPrice(mergedList)
        res.json(mergedList)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
async function scrapeZepto(searchQuery) {
    const url = `https://zepto.in/search?q=${encodeURIComponent(searchQuery)}`;
    console.log(url)
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const products = [];
    $('.product-list-item').each((index, element) => {
        const title = $(element).find('.product-name').text().trim();
        const price = $(element).find('.product-price').text().trim();
        const image = $(element).find('img').attr('src');

        if (title && price) {
            products.push({ title, price, image, from: "Zepto" });
        }
    });
    return products;
}

async function scrapeBigbasket(searchQuery) {
    const url = `https://www.bigbasket.com/ps/?q=${encodeURIComponent(searchQuery)}`;
    console.log(url)
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const products = [];
    $('.product-list li').each((index, element) => {
        const title = $(element).find('.product-name').text().trim();
        const price = $(element).find('.product-price').text().trim();
        const image = $(element).find('.product-image img').attr('src');

        if (title && price) {
            products.push({ title, price, image, from: "Bigbasket" });
        }
    });
    return products;
}
module.exports = router;