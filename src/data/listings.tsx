import Rwanda from "../assets/kigali1.png"
import Uganda from "../assets/kampala.png"
import ConversionCenter from "../assets/ConversionCenter.jpg"
import Hotel from "../assets/Novotel.png"
import type { Listing } from "../store/type"
import  Appartment from "../assets/download1.png"
const images = [Rwanda, Uganda, ConversionCenter, Hotel, Appartment]
const categories = ["Apartments", "Restaurant", "Events", "Hotels", "Shopping", "Fitness"]
const locations = ["Kigali, Rwanda", "Kampala, Uganda", "Nairobi, Kenya", "Dubai, UAE", "Lagos, Nigeria", "Dubai"]
const names = [
  "Green Mart Apartment", "Chuijhal Hotel And Restaurant", "Kigali Convention Center",
  "Novotel Nairobi Hotel", "Kigali Heights Mall", "Kampala Serena Hotel",
  "Lake Victoria Lodge", "Mombasa Beach Resort", "Addis Sky Lounge", "Dar es Salaam Suites",
]

const base: Listing[] = [
  { id: 1, image: Rwanda, featured: true, price: "$12.00 - $40.00", rating: 4.5, reviews: 2391, name: "Green Mart Apartment", verified: true, phone: "(123) 456-7890", category: "Apartments", location: "Kigali, Rwanda", availableFrom: "2026-06-01" },
  { id: 2, image: Uganda, featured: true, price: "$12.00 - $40.00", rating: 4.5, reviews: 2391, name: "Chuijhal Hotel And Restaurant", verified: true, phone: "0798563776", category: "Restaurant", location: "Kampala, Uganda", availableFrom: "2026-07-15" },
  { id: 3, image: ConversionCenter, featured: false, price: "$20.00 - $80.00", rating: 4.2, reviews: 1105, name: "Kigali Convention Center", verified: true, phone: "0788888888", category: "Events", location: "Kigali, Rwanda", availableFrom: "2026-08-01" },
  { id: 4, image: Hotel, featured: true, price: "$15.00 - $50.00", rating: 4.7, reviews: 874, name: "Novotel Nairobi Hotel", verified: false, phone: "(123) 456-7890", category: "Hotels", location: "Nairobi, Kenya", availableFrom: "2024-06-20" },
  { id: 5, image: Rwanda, featured: false, price: "$8.00 - $25.00", rating: 4.0, reviews: 542, name: "Kigali Heights Mall", verified: true, phone: "0789123456", category: "Shopping", location: "Kigali, Rwanda", availableFrom: "2026-09-01" },
  { id: 6, image: Uganda, featured: true, price: "$30.00 - $90.00", rating: 4.8, reviews: 3200, name: "Kampala Serena Hotel", verified: true, phone: "0756987654", category: "Hotels", location: "Kampala, Uganda", availableFrom: "2026-06-10" },
  { id: 6, image: Appartment, featured: true, price: "$400 - $600.30", rating: 4.8, reviews: 400, name: "Dubai Appartment", verified: true, phone:"07865965", category: "Appartment", location: "Dubai", availableFrom: "2026-05-20"}
]

// Generate up to 50 listings
const generated: Listing[] = Array.from({ length: 44 }, (_, i) => ({
  id: i + 7,
  image: images[i % images.length],
  featured: i % 3 === 0,
  price: `$${10 + (i % 5) * 10}.00 - $${40 + (i % 5) * 10}.00`,
  rating: parseFloat((3.8 + (i % 12) * 0.1).toFixed(1)),
  reviews: 100 + i * 47,
  name: `${names[i % names.length]} ${i + 7}`,
  verified: i % 2 === 0,
  phone: `07${String(i).padStart(8, "0")}`,
  category: categories[i % categories.length],
  location: locations[i % locations.length],
  availableFrom: `2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
}))

export const ALL_LISTINGS: Listing[] = [...base, ...generated]