import puppeteer from 'puppeteer-extra';
import main from './main'
import StealthPlugin from 'puppeteer-extra-plugin-stealth';


puppeteer.use(StealthPlugin());


const getAllpossible = async (restroName, cityName) => {
  let outletAddressesss = [];
  
  if (restroName.split(' ').length > 1) {
    restroName = restroName.split(' ').join('-');
  } 

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-http2",
     
    ],
  });
  const page = await browser.newPage();


  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  ];
  await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
  
  new Promise(resolve => setTimeout(resolve, 2000));
  try {


    const searchQuery = `site:zomato.com/${cityName}/${restroName}- -inurl:/restaurace -inurl:/ristoranti -inurl:?subzone= -inurl:/photos -inurl:/menu -inurl:?showAutosuggestModal -inurl:/reviews -inurl:/info -inurl:/book -inurl:?amp= -inurl:/order -inurl:/ -inurl:?`;
    const encodedQuery = encodeURIComponent(searchQuery);
    await page.goto(`https://www.google.com/search?q=${encodedQuery}`, {
      waitUntil: "load",
      timeout: 40000,
    });
    console.log("Navigated to Google Search");
    await new Promise(resolve => setTimeout(resolve, 10000));

    let hasNextPage = true;
    while (hasNextPage) {
      // Wait for the search results to load
      await page.waitForSelector('.g');

      // Extract all the href attributes from the search results
      console.log(cityName)
      const links = await page.evaluate((cityName) => {
        const anchors = document.querySelectorAll(`.g a[href^="https://www.zomato.com/${cityName}/"]`);
        return Array.from(anchors).map((a: any) => a.href);
      }, cityName);

      console.log(`Extracted ${links.length} links from current page`);
      outletAddressesss = outletAddressesss.concat(links);

      // Check if there's a next page
      const nextButton = await page.$('a[id="pnnext"]');
      if (nextButton) {
        await nextButton.click();
        console.log("Clicked Next, waiting for page to load...");
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 10000));
      } else {
        hasNextPage = false;
        console.log("No more pages to navigate");
      }
    }

  } catch (err) {
    console.error("Failed to navigate or extract links:", err.message);
  } finally {
    await browser.close();
  }


        console.log('Filtering restaurant links', outletAddressesss);
      outletAddressesss = outletAddressesss.filter((link) => link.includes(restroName));
       const data = await main(outletAddressesss , false, '');
      return data;
};

// Example usage
export default getAllpossible;