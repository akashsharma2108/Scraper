import { useState, useEffect } from 'react'
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group"
import { Label } from "./components/ui/label"
import { Switch } from "./components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table"
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"

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
  underFour: string | null;
  fourToSeven: string | null;
  aboveSeven: string | null;
  url: string;
}

const cities = [
  "agra", "ahmedabad", "ajmer", "alappuzha", "allahabad", "amravati", "amritsar", "aurangabad",
  "bangalore", "bhopal", "bhubaneswar", "chandigarh", "chennai", "coimbatore", "cuttack",
  "darjeeling", "dehradun", "ncr", "dharamshala", "gangtok", "goa", "gorakhpur", "guntur",
  "guwahati", "gwalior", "haridwar", "hyderabad", "indore", "jabalpur", "jaipur", "jalandhar",
  "jammu", "jamnagar", "jamshedpur", "jhansi", "jodhpur", "junagadh", "kanpur", "khajuraho",
  "khamgaon", "kharagpur", "kochi", "kolhapur", "kolkata", "kota", "lucknow", "ludhiana",
  "madurai", "manali", "mangalore", "manipal", "meerut", "mumbai", "mussoorie", "mysore",
  "nagpur", "nainital", "nashik", "neemrana", "ooty", "palakkad", "patiala", "patna",
  "puducherry", "pune", "pushkar", "raipur", "rajkot", "ranchi", "rishikesh", "salem",
  "shimla", "siliguri", "srinagar", "surat", "thrissur", "tirupati", "trichy", "trivandrum",
  "udaipur", "vadodara", "varanasi", "vellore", "vijayawada", "visakhapatnam"
]

export default function Home() {
  const [restroName, setRestroName] = useState('burger king')
  const [currentLocation, setCurrentLocation] = useState('false')
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<Restaurant[] | null>(null)
  const [inDepthSearch, setInDepthSearch] = useState(false)
  const [selectedCity, setSelectedCity] = useState('bangalore')

  useEffect(() => {
    if (inDepthSearch) {
      setCurrentLocation('false')
    }
  }, [inDepthSearch])

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:4000/api/scrapedata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          restroName, 
          currentLocation, 
          inDepth: inDepthSearch.toString(),
          cityName: inDepthSearch ? selectedCity : ''
        }),
      })
      const result = await response.json()
      setData(result.flat())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSV = () => {
    if (!data) return

    const headers = [
      'Restaurant Name',
      'City',
      'Overall Rating',
      'Total Rating',
      'Delivery Rating',
      'Total Delivery Rating',
      'Open Time',
      'Phone Number',
      'Address',
      'Under 4',
      '4 to 7',
      'Above 7',
      'URL'
    ]

    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.restaurantName,
        item.city,
        item.overallRating,
        item.totalRating,
        item.deliveryRating,
        item.totalDeliveryRating,
        item.openTime,
        item.phoneNumber,
        `"${item.address}"`,
        item.underFour || '',
        item.fourToSeven || '',
        item.aboveSeven || '',
        item.url
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${restroName}_restaurants.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const transferToGoogleSheets = () => {
    // Placeholder function for Google Sheets transfer
    console.log('Transferring to Google Sheets...')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-xl p-8 space-y-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Scrape your favorite restaurant
        </h1>
        <div className="space-y-4">
          <div className="flex space-x-4">
            {inDepthSearch && (
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[180px]" style={{
                  backgroundColor: 'white',
                }}>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto" style={{
                  backgroundColor: 'white',
                }}>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city} className="capitalize">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input
              type="text"
              placeholder="Enter restaurant name"
              value={restroName}
              onChange={(e) => setRestroName(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <RadioGroup 
              value={currentLocation} 
              onValueChange={setCurrentLocation} 
              className="flex space-x-4"
              disabled={inDepthSearch}
              style={{
                display: inDepthSearch ? 'none' : '',
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="current-location" />
                <Label htmlFor="current-location" className="text-sm font-medium">
                  Current Location Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="all-cities" />
                <Label htmlFor="all-cities" className="text-sm font-medium">
                  All Major Cities in India
                </Label>
              </div>
            </RadioGroup>
            <div className="flex items-center space-x-2">
              <Switch
                id="in-depth-search"
                checked={inDepthSearch}
                onCheckedChange={setInDepthSearch}
              />
              <Label htmlFor="in-depth-search" className="text-sm font-medium">
                In-Depth Search
              </Label>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-gray-600">
            <Loader2 className="h-8 w-4 animate-spin mx-auto mb-2" />
            {currentLocation === 'true' 
              ? 'Scraping data for your current location...' 
              : `Scraping data ${inDepthSearch ? " of " + restroName + " in " + selectedCity   : "for major cities in India"}... might take a while`}
            <p>Please complete any reCAPTCHA in the test browser if prompted.</p>
          </div>
        )}

        {data && (
          <>
            <div className="overflow-x-auto" 
            style={{
              width: '100%',
              maxWidth: 'calc(100vw - 4rem)',
            }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Overall Rating</TableHead>
                    <TableHead>Total Rating</TableHead>
                    <TableHead>Delivery Rating</TableHead>
                    <TableHead>Total Delivery Rating</TableHead>
                    <TableHead>Open Time</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Under 4</TableHead>
                    <TableHead>4 to 7</TableHead>
                    <TableHead>Above 7</TableHead>
                    <TableHead>URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.restaurantName}</TableCell>
                      <TableCell>{item.city}</TableCell>
                      <TableCell>{item.overallRating}</TableCell>
                      <TableCell>{item.totalRating}</TableCell>
                      <TableCell>{item.deliveryRating}</TableCell>
                      <TableCell>{item.totalDeliveryRating}</TableCell>
                      <TableCell>{item.openTime}</TableCell>
                      <TableCell>{item.phoneNumber}</TableCell>
                      <TableCell>{item.address}</TableCell>
                      <TableCell>{item.underFour}</TableCell>
                      <TableCell>{item.fourToSeven}</TableCell>
                      <TableCell>{item.aboveSeven}</TableCell>
                      <TableCell>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <Button onClick={downloadCSV}>Download CSV</Button>
              <Button onClick={transferToGoogleSheets} disabled>Transfer to Google Sheets</Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

