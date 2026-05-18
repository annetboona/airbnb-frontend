import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search, MapPin, ChevronDown, Building2, UtensilsCrossed,
  Headphones, ShoppingBag, Tv, Dumbbell, ArrowUpRight,
  ArrowRight, Phone, Mail, Globe, Send, Share2,
  Heart, Star, Compass, ChevronLeft, ChevronRight,
  CheckCircle, MessageCircleCheck,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { Listing, PaginatedListings } from "../../../store/type"

// ── Images ──
import imgConvention from "../../../assets/ConversionCenter.jpg"
import imgRestaurant from "../../../assets/download1.jpg"
import imgApartment  from "../../../assets/download1.png"
import imgPool       from "../../../assets/download2.png"
import imgNightHotel from "../../../assets/HotelNightview.png"
import imgHotel      from "../../../assets/hotel.jpg"
import imgKps        from "../../../assets/kps.jpg"

/* ─── Static Data ───────────────────────────────────────── */
const categories = [
  { icon: <Building2 size={26} />,       name: "Apartment",  key: "APARTMENT"  },
  { icon: <UtensilsCrossed size={26} />, name: "Restaurant", key: "RESTAURANT" },
  { icon: <Headphones size={26} />,      name: "Music",      key: "MUSIC"      },
  { icon: <ShoppingBag size={26} />,     name: "Shopping",   key: "SHOPPING"   },
  { icon: <Tv size={26} />,              name: "TV Shows",   key: "TV"         },
  { icon: <Dumbbell size={26} />,        name: "Gymnasiums", key: "GYM"        },
]



const steps = [
  { n: 1, title: "Input your location to start looking for landmarks.", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pharetra vitae quam integer semper." },
  { n: 2, title: "Make an appointment at the place you want to visit.",  desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pharetra vitae quam integer."        },
  { n: 3, title: "Visit the place and enjoy the experience.",            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pharetra vitae quam integer aenean."   },
]

const testimonials = [
  { text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here', making it look like readable English.", author: "MARK, SOUTH EVERETT" },
  { text: "Working with this platform was an absolute game changer. We found our ideal location within days and the recommendations were spot on. Highly recommend to anyone looking for quality listings.", author: "SARAH, NEW YORK" },
]

// Fallback region images when listing has no photo
const fallbackRegionImgs = [imgConvention, imgNightHotel, imgPool, imgHotel, imgKps, imgRestaurant]

/* ─── Component ─────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate()
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [searchQuery, setSearchQuery]       = useState("")
  const [searchLocation, setSearchLocation] = useState("")

  const prevT = () => setTestimonialIdx(i => (i - 1 + testimonials.length) % testimonials.length)
  const nextT = () => setTestimonialIdx(i => (i + 1) % testimonials.length)

  // ── Fetch real listings for regions & places ──
  const { data: listingsData } = useQuery({
    queryKey: ["listings-home"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedListings>("/listings?limit=20")
      return data.data as Listing[]
    },
  })

  const listings = listingsData ?? []

  // ── Derive regions from unique listing locations (top 4) ──
  const regionMap = new Map<string, { city: string; country: string; count: number; img: string }>()
  listings.forEach((l) => {
    const parts   = l.location.split(",")
    const city    = parts[0]?.trim() ?? l.location
    const country = parts[1]?.trim() ?? ""
    const key     = city.toLowerCase()
    if (!regionMap.has(key)) {
      const photo = l.photos?.[0]?.url ?? fallbackRegionImgs[regionMap.size % fallbackRegionImgs.length]
      regionMap.set(key, { city, country, count: 1, img: photo })
    } else {
      regionMap.get(key)!.count++
    }
  })
  const regions = Array.from(regionMap.values()).slice(0, 4)

  // Category counts from real listings
  const categoryCounts = categories.map(cat => ({
    ...cat,
    count: listings.filter(l =>
      l.title?.toLowerCase().includes(cat.name.toLowerCase())
    ).length,
  }))

  // Featured places (first 2 listings)
  const featuredPlaces = listings.slice(0, 2)

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery)    params.set("q", searchQuery)
    if (searchLocation) params.set("location", searchLocation)
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden">

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section className="relative min-h-[580px] bg-cover bg-center overflow-hidden flex items-center justify-center" style={{ backgroundImage: `url(${imgConvention})` }}>
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 text-center px-6 py-20">
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
            Just Input Your Location &amp; Find
          </h1>
          <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mt-2">
            <span className="italic font-black relative inline-block" style={{ fontFamily: "Georgia, serif" }}>
              Important
              <svg viewBox="0 0 200 10" className="absolute -bottom-1.5 left-0 w-full" fill="none">
                <path d="M0 5 Q50 0 100 5 Q150 10 200 5" stroke="#ef4444" strokeWidth="3" fill="none" />
              </svg>
            </span>
            {" "}&amp; Exciting Spots
          </h2>
          <p className="text-white/75 mt-5 text-base">
            You'll get comprehensive results based on the provided location.
          </p>

          {/* Search Bar */}
          <div className="flex items-center bg-white rounded-full shadow-2xl px-5 py-3 max-w-2xl mx-auto mt-8 gap-3">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="What are you looking for?"
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
            <div className="w-px h-6 bg-gray-200 shrink-0" />
            <MapPin size={16} className="text-gray-400 shrink-0" />
            <input
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Location"
              className="w-28 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
            <ChevronDown size={14} className="text-gray-400 shrink-0" />
            <button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shrink-0 whitespace-nowrap"
            >
              Search places
            </button>
          </div>
        </div>
      </section>

      {/* ══ FEATURED CATEGORIES ═════════════════════════════ */}
      <section className="bg-[#faf7f4] py-20 px-6">
        <div className="text-center mb-12">
          <p className="text-orange-500 text-3xl mb-2" style={{ fontFamily: "'Dancing Script','Brush Script MT',cursive" }}>
            Let's Explore!
          </p>
          <h2 className="text-4xl font-black text-gray-900">Featured Categories</h2>
          <p className="text-gray-500 mt-3 text-sm">
            Discover exciting categories.{" "}
            <span className="text-orange-500 font-semibold">Find what you're looking for.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {categoryCounts.map((cat, i) => (
            <button
              key={i}
              onClick={() => navigate(`/listings?category=${cat.key}`)}
              className="flex items-center justify-between bg-white rounded-2xl px-8 py-5 shadow-sm hover:shadow-orange-100 hover:shadow-lg transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-orange-500">{cat.icon}</div>
                <div>
                  <p className="font-bold text-gray-900 text-base">{cat.name}</p>
                  <p className="text-gray-400 text-sm">
                    {cat.count > 0 ? `${cat.count}+ listings` : "listings"}
                  </p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
            </button>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-3xl mb-2" style={{ fontFamily: "'Dancing Script','Brush Script MT',cursive" }}>
            Best Way
          </p>
          <h2 className="text-4xl font-black text-gray-900 max-w-lg mx-auto leading-tight">
            Find Your Dream Place The Best Way
          </h2>
          <p className="text-gray-500 mt-3 text-sm">
            Discover exciting categories.{" "}
            <span className="text-orange-500 font-semibold">Find what you're looking for.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto relative">
          {/* Dashed connector */}
          <div className="hidden md:block absolute top-9 left-[20%] right-[20%] border-t-2 border-dashed border-orange-300 opacity-40 pointer-events-none" />
          {steps.map((s, i) => (
            <div key={i} className="text-center relative">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto mb-6 shadow-lg ${i === 1 ? "bg-orange-600 shadow-orange-300" : "bg-orange-500 shadow-orange-200"}`}>
                {s.n}
              </div>
              <h3 className="font-extrabold text-gray-900 text-base mb-3 leading-snug">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TOP REGIONS ═════════════════════════════════════ */}
      <section className="bg-gray-900 py-20 overflow-hidden">
        <div className="text-center mb-10">
          <p className="text-orange-400 text-3xl mb-2" style={{ fontFamily: "'Dancing Script','Brush Script MT',cursive" }}>
            Top Regions
          </p>
          <p className="text-gray-400 text-sm">
            Discover exciting categories.{" "}
            <span className="text-orange-400 font-semibold">Find what you're looking for.</span>
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto px-12">
          {regions.length === 0 ? (
            /* Fallback static regions while loading */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { country:"Rwanda",  city:"Kigali",       listings:"100+", img: imgConvention },
                { country:"Africa",  city:"Luxury Hotel", listings:"59+",  img: imgNightHotel },
                { country:"Resort",  city:"Pool Retreat", listings:"89+",  img: imgPool       },
                { country:"Europe",  city:"City Hotel",   listings:"65+",  img: imgHotel      },
              ].map((r, i) => (
                <RegionCard key={i} {...r} onClick={() => navigate(`/listings?location=${r.city}`)} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {regions.map((r, i) => (
                <RegionCard
                  key={i}
                  country={r.country}
                  city={r.city}
                  listings={`${r.count}+`}
                  img={r.img}
                  onClick={() => navigate(`/listings?location=${r.city}`)}
                />
              ))}
            </div>
          )}

          {/* Arrows */}
          <button className="absolute top-1/2 left-0 -translate-y-1/2 w-10 h-10 rounded-full bg-white/25 hover:bg-white/40 border-none flex items-center justify-center text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button className="absolute top-1/2 right-0 -translate-y-1/2 w-10 h-10 rounded-full bg-white/25 hover:bg-white/40 border-none flex items-center justify-center text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* ══ DISCOVER YOUR FAVOURITE PLACE ════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
          {/* Left */}
          <div className="lg:col-span-2">
            <p className="text-orange-500 text-3xl mb-1" style={{ fontFamily: "'Dancing Script','Brush Script MT',cursive" }}>Places</p>
            <h2 className="text-4xl font-black text-gray-900 leading-tight mb-4">Discover Your Favourite Place</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-7">
              Our publications can provide quality and useful tips and advice for companies on how to evaluate providers and choose the best one for their needs, taking into account factors such as price, features and support.
            </p>
            <button
              onClick={() => navigate("/listings")}
              className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-7 py-3.5 rounded-lg transition-all"
            >
              View All Places
            </button>
          </div>

          {/* Right — listing cards */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {featuredPlaces.length > 0 ? featuredPlaces.map((l, i) => (
              <button
                key={l.id}
                onClick={() => navigate(`/listings/${l.id}`)}
                className="grid grid-cols-[180px_1fr] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow text-left bg-white"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={l.photos?.[0]?.url ?? imgApartment}
                    alt={l.title}
                    className="w-full h-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded">
                      ⭐ FEATURED
                    </span>
                  )}
                  <span className="absolute bottom-2.5 left-2.5 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                    ${l.pricePerNight}/night
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={13} fill="#f97316" className="text-orange-400" />
                    <span className="font-bold text-orange-500 text-sm">4.5</span>
                    <span className="text-gray-400 text-xs">2,391 reviews</span>
                    <Heart size={14} className="text-gray-300 ml-auto" />
                  </div>
                  <h3 className="font-extrabold text-gray-800 text-base mb-2 flex items-center gap-2">
                    {l.title}
                    <CheckCircle size={15} fill="#22c55e" className="text-white shrink-0" />
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{l.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><MapPin size={12} />{l.location}</span>
                    <span className="flex items-center gap-1.5 text-orange-500"><Compass size={12} /> Directions</span>
                  </div>
                </div>
              </button>
            )) : (
              /* Fallback cards while loading */
              [{
                name: "Green Mart Apartment", img: imgApartment, badge: true,
                desc: "Amet minim mollit non deserunt ullamco est sit aliqua dolor.", phone: "(123) 456-7890",
              }, {
                name: "Chuijhal Hotel & Restaurant", img: imgRestaurant, badge: false,
                desc: "Amet minim mollit non deserunt ullamco est sit aliqua dolor.", phone: "(123) 456-7890",
              }].map((p, i) => (
                <button
                  key={i}
                  onClick={() => navigate("/listings")}
                  className="grid grid-cols-[180px_1fr] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow text-left bg-white"
                >
                  <div className="relative min-h-160px overflow-hidden">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                    {p.badge && <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded">⭐ FEATURED</span>}
                    {!p.badge && <span className="absolute top-2.5 left-2.5 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded">10% OFF</span>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star size={13} fill="#f97316" className="text-orange-400" />
                      <span className="font-bold text-orange-500 text-sm">4.5</span>
                      <span className="text-gray-400 text-xs">2,391 reviews</span>
                    </div>
                    <h3 className="font-extrabold text-gray-800 text-base mb-2">{p.name}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-3">{p.desc}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5"><Phone size={12} />{p.phone}</span>
                      <span className="flex items-center gap-1.5 text-orange-500"><Compass size={12} /> Directions</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ══ FIND YOUR PERFECT PLACE ══════════════════════════ */}
      <section className="bg-orange-600 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-7">
              Find your perfect Place<br />based on{" "}
              <span className="italic" style={{ fontFamily: "Georgia,serif" }}>your interest</span>
            </h2>
            <div className="rounded-2xl overflow-hidden h-72">
              <img src={imgKps} alt="Kigali Convention Centre" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="text-white">
            <p className="text-base leading-relaxed opacity-90 mb-6">
              Want to have a fantastic travel experience? Let us connect you with diverse categories of businesses, public spots, and famous landmarks so that you can create unforgettable memories.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Find popular businesses and important sites near you.",
                "Get place recommendations based on your preferences.",
                "Explore major spots and landmarks around your location.",
                "Discover diverse categories to navigate various areas.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-white mt-2 shrink-0" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-orange-600 hover:bg-orange-50 active:scale-95 font-bold px-8 py-3.5 rounded-lg transition-all"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════ */}
      <section className="relative min-h-440px py-20 px-6 text-center overflow-hidden">
        <img src={imgConvention} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/68" style={{ background: "rgba(0,0,0,.68)" }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">See What Our Clients Say About Us</h2>
          <p className="text-white/60 text-sm mb-10">
            Discover exciting categories.{" "}
            <span className="text-orange-400 font-semibold">Find what you're looking for.</span>
          </p>
          <div className="text-white text-6xl opacity-40 leading-none mb-4">"</div>
          <p className="text-white text-base md:text-lg leading-relaxed mb-7">
            {testimonials[testimonialIdx].text}
          </p>
          <p className="text-white font-black tracking-widest text-xs uppercase">{testimonials[testimonialIdx].author}</p>
          <div className="flex justify-center gap-3 mt-8">
            <button onClick={prevT} className="w-10 h-10 rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center hover:bg-white/25 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextT} className="w-10 h-10 rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center hover:bg-white/25 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <footer className="bg-[#1a1f2e] text-white pt-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 pb-12">
          {/* Col 1 */}
          <div>
            <h4 className="font-extrabold text-base mb-3">Get In Touch</h4>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Join our newsletter and receive the best job openings of the week, right in your inbox.
            </p>
            <div className="border border-white/15 rounded-xl p-4 flex items-center gap-3 mb-5">
              <MessageCircleCheck size={20} className="text-green-400 shrink-0" />
              <div>
                <p className="text-white/50 text-xs">Join our Whatsapp:</p>
                <p className="font-bold text-sm">(+250) 788 851 404</p>
              </div>
            </div>
            <p className="text-white/70 text-sm font-bold">Want to join Airbnb? Write us!</p>
            <p className="text-white/50 text-sm mt-1">support@Airbnb.com</p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-extrabold text-base mb-5">Stay Connect</h4>
            <p className="text-white/60 text-sm leading-loose">
              1123 Fictional St, San Francisco<br />CA 94103
            </p>
            <p className="flex items-center gap-2.5 text-white/70 text-sm mt-3">
              <Phone size={14} className="shrink-0" /> (+250) 788 851 404
            </p>
            <p className="flex items-center gap-2.5 text-white/70 text-sm mt-2.5">
              <Mail size={14} className="shrink-0" /> support@AIRBNB.com
            </p>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-extrabold text-base mb-5">Get In Touch</h4>
            <div className="flex bg-white/8 rounded-full overflow-hidden mb-7" style={{ background: "rgba(255,255,255,.08)" }}>
              <input
                placeholder="name@example.com"
                className="flex-1 bg-transparent border-none outline-none px-5 py-3 text-white text-sm placeholder-white/40"
              />
              <button className="w-11 h-11 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center m-1 shrink-0 transition-colors">
                <ArrowRight size={15} className="text-white" />
              </button>
            </div>
            <h4 className="font-extrabold text-sm mb-3">Follow the location</h4>
            <div className="flex gap-2.5">
              {[Globe, Share2, Send].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" style={{ background: "rgba(255,255,255,.1)" }}>
                  <Icon size={15} className="text-white" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-6xl mx-auto border-t border-white/10 py-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-2xl font-black">
            AIR<span className="text-orange-400 italic" style={{ fontFamily: "Georgia,serif" }}>BNB.</span>
          </span>
          <span className="text-white/40 text-sm">© 2026 AIRBNB — All Rights Reserved</span>
          <div className="flex gap-5 text-sm text-white/50">
            {["Privacy","Sitemap","Cookies"].map(item => (
              <button key={item} className="hover:text-white/80 transition-colors">{item}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Region Card sub-component ──────────────────────────── */
function RegionCard({ country, city, listings, img, onClick }: {
  country: string; city: string; listings: string; img: string; onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="relative h-96 rounded-2xl overflow-hidden cursor-pointer shadow-xl group"
    >
      <img src={img} alt={city} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0  from-black/10 to-black/75" />
      <div className="absolute top-6 left-6 text-white">
        <p className="italic text-sm opacity-85" style={{ fontFamily: "Georgia,serif" }}>{country}</p>
        <h3 className="text-3xl font-extrabold mt-1">{city}</h3>
        <p className="text-sm opacity-75 mt-1.5">{listings} listings</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4 border-t border-white/20 bg-black/20 backdrop-blur-sm">
        <span className="text-white text-xs font-bold tracking-widest uppercase">Explore More</span>
        <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
          <ArrowUpRight size={15} className="text-white" />
        </div>
      </div>
    </div>
  )
}