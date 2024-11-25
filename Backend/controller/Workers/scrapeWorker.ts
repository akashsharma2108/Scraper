const { parentPort, workerData } = require('worker_threads');
const puppeteer = require('puppeteer');

const scrapeRestaurant = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--disable-http2", "--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
  );

  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const restaurantData = await page.evaluate(() => {
      const getTextContent = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : null;
      };

      const getRatingInfo = (parentSelector) => {
        const parent = document.querySelector(parentSelector);
        if (parent) {
          const rating = parent.querySelector('.sc-1q7bklc-1')?.textContent.trim();
          const votes = parent.querySelector('.sc-1q7bklc-8')?.textContent.trim();
          return { rating, votes };
        }
        return { rating: null, votes: null };
      };

      const getDeliveryRatingsByDistance = () => {
        const ratings = {
          underFour: null,
          fourToSeven: null,
          aboveSeven: null
        };
        try {
          const underFourElement = document.querySelector('div.sc-1q7bklc-10.gJgFjE .sc-1q7bklc-1.cILgox');
          ratings.underFour = underFourElement ? underFourElement.textContent.trim() : null;
          const fourToSevenElement = document.querySelector('div.sc-1q7bklc-10.kgIEjH .sc-1q7bklc-1.cILgox');
          ratings.fourToSeven = fourToSevenElement ? fourToSevenElement.textContent.trim() : null;
          const aboveSevenElement = document.querySelector('div.sc-1q7bklc-10.fhiOIU .sc-1q7bklc-1.cILgox'); 
          ratings.aboveSeven = aboveSevenElement ? aboveSevenElement.textContent.trim() : null;
        } catch (error) {
          console.error('Error fetching ratings:', error);
        }
      
        return ratings;
      };
      
      const getAddress = () => {
        const h5Elements = Array.from(document.querySelectorAll('h5'));
        const directionH5 = h5Elements.find(el => el.textContent.trim() === 'Direction');
        if (directionH5) {
          const addressP = directionH5.parentElement.querySelector('p[class^="sc-bFADNz"]');
          return addressP ? addressP.textContent.trim() : null;
        }
        return null;
      };

      const restaurantName = getTextContent('h1');
      const { rating: overallRating, votes: totalRating } = getRatingInfo('.sc-keVrkP > div:first-child');
      const { rating: deliveryRating, votes: totalDeliveryRating } = getRatingInfo('.sc-keVrkP > div:nth-child(3)');
      const openTime = getTextContent('.sc-kasBVs');
      const phoneNumber = getTextContent('a[href^="tel:"]');
      const address = getAddress();
      const deliveryRatingsByDistance = getDeliveryRatingsByDistance();
      
      
      

      return {
        restaurantName,
        overallRating,
        totalRating,
        deliveryRating,
        totalDeliveryRating,
        openTime,
        phoneNumber,
        address,
        ...deliveryRatingsByDistance 
      };
    });
      restaurantData.url = url;
    return restaurantData;
  } catch (error) {
    console.error(`Error scraping ${url}: ${error.message}`);
    return null;
  } finally {
    await browser.close();
  }
};


(async () => {
  const results = [];
  for (const url of workerData) {
    console.log(`Worker processing: ${url}`);
    const data = await scrapeRestaurant(url);
    if (data) results.push(data);
  }

  parentPort.postMessage(results);
})();


