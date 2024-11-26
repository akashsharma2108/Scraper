import puppeteer from "puppeteer";
import main from './main';


// Your getRestroDataq function (assuming it's in a separate file)
const getRestroDataq = async (restroName, cityName) => {


  const browser = await puppeteer.launch({
    headless: true, // Set to false for debugging
    args: ["--disable-http2"],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
  );

  try {
    await page.goto("https://www.zomato.com/" + cityName, {
      waitUntil: "load",
      timeout: 40000,
    });
    console.log("Navigated to Zomato");
  } catch (err) {
    console.error("Failed to navigate to Zomato:", err.message);
    await browser.close();
    process.exit();
  }

  try {
    await page.waitForSelector("button[aria-label='Accept cookies']", { timeout: 1000 });
    await page.click("button[aria-label='Accept cookies']");
    console.log("Accepted cookies");
  } catch (err) {
    console.log("No cookie popup found");
  }

  await page.click("input[placeholder='Search for restaurant, cuisine or a dish']");
  await page.keyboard.type(restroName);
  await page.keyboard.press("Enter");

  try {
    await page.waitForSelector('div.sc-hMjcWo.Kwshw button span.sc-1kx5g6g-3.dkwpEa');
    console.log("'View all Delivery outlets' button found");
    let clickedPrimary = false;
    const buttons = await page.$$("button");

    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent.trim(), button);
      if (text.includes("View all Delivery outlets")) {
        await button.click();
        console.log("Clicked 'View all Delivery outlets' button");
        clickedPrimary = true;
        break;
      }
    }

    if (!clickedPrimary) {
      console.log("'View all Delivery outlets' button not found. Attempting fallback...");
      throw new Error("Primary button not found or clickable.");
    }
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    const url = page.url();
    console.log("Navigated to URL after primary button click:", url);
  } catch (primaryErr) {
    console.error("Error with primary button:", primaryErr.message);
    try {
      await page.waitForSelector('div.sc-jPPmml.ixfOjP button span.sc-1kx5g6g-2.bwVPvR', { timeout: 2000 });
      const fallbackButtons = await page.$$("button");
      let clickedFallback = false;

      for (const button of fallbackButtons) {
        const text = await page.evaluate(el => el.textContent.trim(), button);
        if (text.includes("View all outlets")) {
          await button.click();
          console.log("Clicked 'View all outlets' fallback button");
          clickedFallback = true;
          break;
        }
      }
      if (!clickedFallback) {
        
        throw new Error("Fallback button not found or clickable.");
      }
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      const url = page.url();
      console.log("Navigated to URL after fallback button click:", url);
    } catch (fallbackErr) {
      console.error("Error with fallback button:", fallbackErr.message);
      await browser.close();
    }
  }

  // Wait for restaurant cards to load
  try {
    await page.waitForSelector(".sc-1mo3ldo-0", { timeout: 10000 });
    console.log("Restaurant cards loaded");
  } catch (err) {
    console.error("Failed to load restaurant cards:", err.message);
    await browser.close();
    process.exit();
  }

  let restaurantLinks = [];
  try {
    let previousHeight = 0;
    while (true) {
      previousHeight = await page.evaluate(() => document.body.scrollHeight); 
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); 
      console.log("Scrolling down...");
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      const newLinks = await page.evaluate(() => {
        const cards = document.querySelectorAll(".sc-1mo3ldo-0 a");
        return Array.from(cards).map((card : any) => card.href);
      });
      restaurantLinks = [...new Set([...restaurantLinks, ...newLinks])];
      console.log(`Loaded ${restaurantLinks.length} links so far...`);
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      if (newHeight === previousHeight) {
        console.log("Reached the bottom of the page.");
        break;
      }
    }
  } catch (err) {
    console.error("Error during scrolling or loading:", err.message);
  }

  console.log('Filtering restaurant links', restaurantLinks);
    let orginalRestroName = restroName;
  restroName = restroName.trim();
  const mainurl = page.url();
  const restroNameArray = mainurl.split('/');
  restroName = restroNameArray[5];
  if (restroName) {
    restroName = restroName.split('?')[0];
  }
  restaurantLinks = restaurantLinks.filter((link) => (link.includes(restroName) || link.includes(orginalRestroName)) && link !== mainurl);
  restaurantLinks = restaurantLinks.map(link => {
    if (link.includes('/order') || link.includes('/info')) {
      return link.split('/').slice(0, -1).join('/');
    }
    return link; 
  });

  console.log(`Found ${restaurantLinks.length} ${restroName} restaurants. Here are the links: `, restaurantLinks);
  await browser.close();

   // Return the restaurant links
    return restaurantLinks;
  
};




// Array of cities
const cityarray = [
  "Mumbai", "ncr"
];

// Split the array into batches of 4 cities at a time

// (async () => {
//   const data = {};

//   // Fetch restaurant links for all cities
//   for (let i = 0; i < cityarray.length; i++) {
//     const city = cityarray[i];
//     const restaurantLinks = await getRestroDataq("subway", city);
//     data[city] = restaurantLinks;
//   }

//   // Final result aggregation
//   let finaldata = {};
//   for (const city in data) {
//     const restaurantLinks = data[city];

//     // Call the main function for each city's restaurant links
//     const cityData = await main(restaurantLinks, true, `${city}-data`);
//     finaldata[city] = cityData; // Store the result for each city
//   }

//   // Log the final data for all cities
//   console.log("Final Aggregated Data:", finaldata);
// })();;


const getallrestodata = async (restroName) => {
  const randomfilenameString = Math.random().toString(36).substring(7);
  const data = {};
  for (let i = 0; i < cityarray.length; i++) {
    const city = cityarray[i];
    const restaurantLinks = await getRestroDataq(restroName, city);
    data[city] = restaurantLinks;
  }

  let finaldata = {};
  for (const city in data) {
    const restaurantLinks = data[city];
    const cityData = await main(restaurantLinks, true, `${randomfilenameString}-data`);
    finaldata[city] = cityData;
  }

  return finaldata;
}


export default getallrestodata;