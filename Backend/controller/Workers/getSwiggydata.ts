import puppeteer from "puppeteer";
import main from './main'

const getSwiggydata = async (restroName, cityName, userName, bothRestro) => {
  let outletAddresses = [];

  if (restroName.split(' ').length > 1) {
    restroName = restroName.split(' ').join('-');
  } 

  console.log("Launching browser..." , restroName , cityName);
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-http2"],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
  );
  const urlsss = `https://www.swiggy.com/city/${cityName}/${restroName}`;
    console.log(urlsss);
  try {
    await page.goto(`https://www.swiggy.com/city/${cityName}/${restroName}`, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    console.log("Navigated to Swiggy Subway page");

    while (true) {
      const showMoreButton = await page.$('.RestaurantList__ShowMoreContainer-sc-1d3nl43-0');
      if (!showMoreButton) {
        console.log("No more 'Show more' button found. Exiting loop.");
        break;
      }

      await showMoreButton.click();
      console.log("Clicked 'Show more' button");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    const links = await page.$$eval('.sc-gLLvby.jXGZuP a', (elements) => 
      elements.map((el) => el.href)
    );

    outletAddresses = links;
    console.log(`Found ${outletAddresses.length} Subway outlets`);

  } catch (err) {
    console.error("An error occurred:", err.message);
  } finally {
    await browser.close();
  }

  console.log("Getting data for each outlet..." , outletAddresses);
  const data =bothRestro ? outletAddresses : await main(outletAddresses , false, userName , true , false);
  return data;
};

export default getSwiggydata;