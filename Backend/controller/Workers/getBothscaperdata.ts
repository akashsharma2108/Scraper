import getSwiggydata from "./getSwiggydata";
import getAllpossible from "./getAllpossible";
import main from './main'

const getBothscaperdata = async (restroName, cityName, userName) => {

   try{
      let swiggy = await getSwiggydata(restroName, cityName , userName, true);
      let zomato = await getAllpossible(restroName, cityName , userName , true);
        const links = {
            swiggy : swiggy,
            zomato : zomato
        }
        if(swiggy.length === 0 && zomato.length === 0){
            return {message : 'No data found for the given restaurant'};
        }
        console.log('Both scraper data', links);
         const data = await main(links , false, userName , false , true);
            return data;
   }catch(err){
     console.log(err);
   }


}

export default getBothscaperdata;