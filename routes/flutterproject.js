const router = require('express').Router();
const axios = require('axios');
const cheerio = require('cheerio');

router.post('/', async (req, res) => {
    const searchQuery = req.body.searchQuery;

    try {
        const amazonProducts = await scrapeAmazon(searchQuery);
        let flipkartProducts = await scrapeFlipkart(searchQuery);
        if (flipkartProducts.length == 0) {
            flipkartProducts = await scrapeFlipkart11(searchQuery)
        }
        const mergedList = amazonProducts.concat(flipkartProducts)
        const sortedData = sortProductsByPrice(mergedList)
        res.json({ success: true, products: sortedData })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
function sortProductsByPrice(products) {
    return products.sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9.-]+/g, ""));
        const priceB = parseFloat(b.price.replace(/[^0-9.-]+/g, ""));
        return priceA - priceB;
    });
}

async function scrapeAmazon(searchQuery) {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const products = [];
    $('.s-result-item').each((index, element) => {
        const title = $(element).find('h2 a').text().trim();
        const price = $(element).find('.a-price-whole').text().trim();
        const image = $(element).find('img').attr('src');
        if (title && price) {
            products.push({ title, price, image, from: "Amazon" });
        }
    });
    return products;
}

async function scrapeFlipkart(searchQuery) {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const products = [];
    $('._1AtVbE').each((index, element) => {
        const title = $(element).find('._4rR01T').text().trim();
        const price = $(element).find('._30jeq3._1_WHN1').text().trim();
        const image = $(element).find('img').attr('src');
        if (title && price) {
            products.push({ title, price, image, from: "Flipkart" });
        }
    });
    return products;
}

async function scrapeFlipkart11(searchQuery) {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const products = [];
    $('._4ddWXP').each((index, element) => {
        const title = $(element).find('a.s1Q9rs').text().trim();
        const price = $(element).find('._30jeq3').text().trim();
        const image = $(element).find('img').attr('src');
        if (title && price) {
            products.push({ title, price, image, from: "Flipkart" });
        }
    });
    return products;
}

module.exports = router;
