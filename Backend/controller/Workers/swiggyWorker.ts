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
        const restaurantName = document.querySelector('h1.sc-aXZVg.cNRZhA')?.textContent.trim();
  
        const ratingElement = document.querySelector('div.sc-fyVfxW.IgZcF + div.sc-aXZVg.eqdoYF');
         let overallRating = null;
          let totalRating = null;
  
           if (ratingElement) {
            const ratingText = ratingElement.textContent.trim();
             const ratingMatch = ratingText.match(/^([\d.]+)/); // Matches overall rating (e.g., 4.3)
             const totalRatingMatch = ratingText.match(/([\d.]+K?\+?)\s*ratings/); // Matches total ratings (e.g., 19K+)
  
              if (ratingMatch) overallRating = ratingMatch[1];
              if (totalRatingMatch) totalRating = totalRatingMatch[1];
           }
  
        const address = document.querySelector('div.sc-aXZVg.fVWuLc.sc-epqpcT.dwOtiH')?.textContent.trim();
        const openTime = document.querySelector('div.sc-cyRcrZ.kSLQyY div.sc-aXZVg.kYrnMC')?.textContent.trim();
  
      
  
  
        return {
          restaurantName,
          overallRating,
          totalRating,
          address,
          openTime,
          deliveryRating : "NA for Swiggy",
          totalDeliveryRating : "NA for Swiggy",
          phoneNumber : "NA for Swiggy",
          underFour: "NA for Swiggy",
          fourToSeven: "NA for Swiggy",
          aboveSeven: "NA for Swiggy"
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


