import express from 'express';
import  getRestroData  from '../Workers/getlink';
import getallrestodata from '../Workers/getlinkforindia';
import getAllpossible from '../Workers/getAllpossible';
import getBothscaperdata from '../Workers/getBothscaperdata';
import getSwiggydata from '../Workers/getSwiggydata';


export const Scrapper = async (req : express.Request, res : express.Response) => {
  const { restroName , currentLocation , inDepth , cityName, userName , restroType } = req.body;

  if (!restroName) {
    return res.status(400).json({ message: 'Please provide a restaurant name' });
  }

  const city = [
    "agra",
    "ahmedabad",
    "ajmer",
    "alappuzha",
    "allahabad",
    "amravati",
    "amritsar",
    "aurangabad",
    "bangalore",
    "bhopal",
    "bhubaneswar",
    "chandigarh",
    "chennai",
    "coimbatore",
    "cuttack",
    "darjeeling",
    "dehradun",
    "ncr",
    "dharamshala",
    "gangtok",
    "goa",
    "gorakhpur",
    "guntur",
    "guwahati",
    "gwalior",
    "haridwar",
    "hyderabad",
    "indore",
    "jabalpur",
    "jaipur",
    "jalandhar",
    "jammu",
    "jamnagar",
    "jamshedpur",
    "jhansi",
    "jodhpur",
    "junagadh",
    "kanpur",
    "khajuraho",
    "khamgaon",
    "kharagpur",
    "kochi",
    "kolhapur",
    "kolkata",
    "kota",
    "lucknow",
    "ludhiana",
    "madurai",
    "manali",
    "mangalore",
    "manipal",
    "meerut",
    "mumbai",
    "mussoorie",
    "mysore",
    "nagpur",
    "nainital",
    "nashik",
    "neemrana",
    "ooty",
    "palakkad",
    "patiala",
    "patna",
    "puducherry",
    "pune",
    "pushkar",
    "raipur",
    "rajkot",
    "ranchi",
    "rishikesh",
    "salem",
    "shimla",
    "siliguri",
    "srinagar",
    "surat",
    "thrissur",
    "tirupati",
    "trichy",
    "trivandrum",
    "udaipur",
    "vadodara",
    "varanasi",
    "vellore",
    "vijayawada",
    "visakhapatnam"
  ]
   

  type Restaurant = {
    restaurantName: string;
    city: string;
    overallRating: string;
    totalRating: string;
    deliveryRating: string;
    totalDeliveryRating: string;
    openTime: string;
    phoneNumber: string;
    address: string;
    underFour: string;
    fourToSeven: string;
    aboveSeven: string | null;
    url: string;
};

function transformRestaurantData(data: Record<string, any>): Restaurant[] {
    const result: Restaurant[] = [];

    for (const city in data) {
        const cityData = data[city];
        cityData.forEach((restaurants: any[]) => {
            restaurants.forEach((restaurant: any) => {
                result.push({
                    restaurantName: restaurant.restaurantName,
                    city: city,
                    overallRating: restaurant.overallRating,
                    totalRating: restaurant.totalRating,
                    deliveryRating: restaurant.deliveryRating,
                    totalDeliveryRating: restaurant.totalDeliveryRating,
                    openTime: restaurant.openTime,
                    phoneNumber: restaurant.phoneNumber,
                    address: restaurant.address,
                    underFour: restaurant.underFour,
                    fourToSeven: restaurant.fourToSeven,
                    aboveSeven: restaurant.aboveSeven,
                    url: restaurant.url,
                });
            });
        });
    }

    return result;
}
 
    // check cityName is present in city array or not
    if(cityName && !city.includes(cityName)){
      return res.status(400).json({ message: 'Please provide a valid city name' });
    }

  try {
    let data: any;

    switch (true) {
      case inDepth === 'true' && restroType === 'both':
        data = await getBothscaperdata(restroName, cityName, userName);
        break;
    
      case inDepth === 'true' && restroType === 'zomato':
        data = await getAllpossible(restroName, cityName, userName, false);
        break;

      case inDepth === 'true' && restroType === 'swiggy':
        data = await getSwiggydata(restroName, cityName, userName, false);
        break;
    
      case currentLocation === 'true':
        data = await getRestroData(restroName, userName);
        break;
    
      default:
        data = await getallrestodata(restroName, userName);
        break;
    }
    
    const finaldata =inDepth ==='false' && currentLocation === 'false' ? transformRestaurantData(data) : data ;
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    return res.status(200).json(finaldata);
  } catch (error) {
    console.error('Error while scraping data:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }

  
};


