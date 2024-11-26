import express from 'express';
import  getRestroData  from '../Workers/getlink';
import getallrestodata from '../Workers/getlinkforindia';


export const Scrapper = async (req : express.Request, res : express.Response) => {
  const { restroName , currentlocation } = req.body;

  if (!restroName) {
    return res.status(400).json({ message: 'Please provide a restaurant name' });
  }
   

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
 


  try {
    const data = currentlocation === 'true' ? await getRestroData(restroName) as any : await getallrestodata(restroName) as any;
    const finaldata = currentlocation === 'true' ? data : transformRestaurantData(data);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    return res.status(200).json(finaldata);
  } catch (error) {
    console.error('Error while scraping data:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }

  
};


