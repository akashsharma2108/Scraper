import puppeteer from 'puppeteer';
import main from './main'
import { exit } from 'process';



const getRestroData = async (restroName) => {

    const browser = await puppeteer.launch({
        headless: true, // Set to false for debugging
        args: ["--disable-http2"],
      });
      const page = await browser.newPage();
    
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
      );
    
      try {
        await page.goto("https://www.zomato.com", {
          waitUntil: "load",
          timeout: 40000,
        });
        console.log("Navigated to Zomato");
      } catch (err) {
        console.error("Failed to navigate to Zomato:", err.message);
        await browser.close();
        exit();
      }
    
      // Handle cookies popup
      try {
        await page.waitForSelector("button[aria-label='Accept cookies']", { timeout: 1000 });
        await page.click("button[aria-label='Accept cookies']");
        console.log("Accepted cookies");
      } catch (err) {
        console.log("No cookie popup found");
      }
    
      // Search for "Subway" in Bengaluru
      await page.click("input[placeholder='Search for restaurant, cuisine or a dish']");
      await page.keyboard.type(restroName);
      await page.keyboard.press("Enter");
    let url ;
    try {
        await page.waitForSelector('div.sc-dTsoBL.kLpknk button span.sc-1kx5g6g-3.dkwpEa');
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
            await page.waitForSelector('div.sc-kWHCRG.izhZTU button span.sc-1kx5g6g-3.dkwpEa', { timeout: 2000 });
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
        exit();
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
            return Array.from(cards).map((card : any)  => card.href)
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
       //filter anything with restaurants
       console.log('Filtering restaurant links', restaurantLinks);
       restroName = restroName.trim(); // Remove any leading/trailing spaces

       restaurantLinks = restaurantLinks.filter(link => 
           link.toLowerCase().includes(restroName.toLowerCase()) && // Check for restaurant name match
           link !== url && // Exclude the specific URL
           !link.toLowerCase().includes('restaurants') // Exclude links containing "restaurants"
       );
    console.log(`Found ${restaurantLinks.length} ${restroName} restaurants. Here are the links: `, restaurantLinks); 
      await browser.close();
      
        const data = await main(restaurantLinks);
        return data;
};


export default getRestroData;