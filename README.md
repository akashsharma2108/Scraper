
# scraper Application

This is a scraper tool designed to fetch data for your favorite restaurants and provide detailed ratings.

---

## Access the Application

### Method 1: Clone and Run Both Backend and Frontend (Recommended)

Follow these steps to run the application locally:

1. Clone this repository (master branch).  
2. Navigate to the **Backend** directory:  
   ```bash
   cd Backend
   ```
3. Install dependencies:  
   ```bash
   npm install
   ```
4. Start the backend server:  
   ```bash
   npm run dev
   ```

5. Open a new terminal, navigate to the **FrontEnd** directory:  
   ```bash
   cd ../FrontEnd
   ```
6. Install frontend dependencies:  
   ```bash
   npm install
   ```
7. Start the frontend server:  
   ```bash
   npm run dev
   ```

8. Once the frontend is running, you'll get a URL like `http://localhost:5173`. Open it in your browser to use the app.

**Note:** The response might take a few minutes, depending on the size of the data being scraped.

---

### Method 2: Running Only the Backend

If you only want to run the backend, follow these steps:

1. Clone this repository.  
2. Navigate to the **Backend** directory:  
   ```bash
   cd Backend
   ```
3. Install backend dependencies:  
   ```bash
   npm install
   ```
4. Start the backend server:  
   ```bash
   npm run dev
   ```

5. In a new terminal, send a POST request to scrape data. For example:  
   ```bash
   curl -X POST http://localhost:4000/api/scrapedata    -H "Content-Type: application/json"    -d '{
       "restroName": "chowman"
       "currentLocation" : "false" 
       "inDepth" : "true"
       "cityName" : "bangalore"
       "restroType" : "zomato",
       "userName" : "backend"
   }'
   ```


Replace `"chowman"` with the name of your desired restaurant.  
Replace `"currentLocation"` to `"true"` if you want to see major city data.
make sure  `"currentLocation"` set to `"fasle"` when inDepth search is enable.
Test browser will pop up if any reCAPTCHA is there be fill that.
`"restroType"` has only three possible options "zomato" , "swiggy" and "both" this is mandatory field with in depth true.
`"userName"` can't be empty an  and`"cityNmae"` is mandatory field with in depth true.



**Note:** You can also send POST requests using Postman.  

---

  

## About the Application

This application allows you to:  
- Scrape restaurant data.  
- View detailed ratings and other relevant information.

---

## Feel Free to Reach Out

For any queries or suggestions, contact me:  
- **Email:** [akashsharma90099@gmail.com](mailto:akashsharma90099@gmail.com)  

Thank you for visiting my repository! 😊
