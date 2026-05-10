import { Search, MapPin, ChevronDown, Building2, UtensilsCrossed, Headphones, ShoppingBag, Tv, Dumbbell, ArrowUpRight, } from "lucide-react"
import Rwanda from "../../../assets/ConversionCenter.jpg"

const categories = [
  { icon: <Building2 size={28} />, name: "Appartment", count: "99+ listings" },
  { icon: <UtensilsCrossed size={28} />, name: "Restaurant", count: "55+ listings" },
  { icon: <Headphones size={28} />, name: "Music", count: "55+ listings" },
  { icon: <ShoppingBag size={28} />, name: "Shopping", count: "80+ listings" },
  { icon: <Tv size={28} />, name: "TV Shows", count: "96+ listings" },
  { icon: <Dumbbell size={28} />, name: "Gymnasiums", count: "21+ listings" },
]

const heroImages = [Rwanda, Rwanda, Rwanda, Rwanda, Rwanda, Rwanda, Rwanda, Rwanda]

function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Hero Section ── */}
      <section className="relative h-580px overflow-hidden">

        {/* Collage background grid */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-1">
          {heroImages.map((img, i) => (
            <div
              key={i}
              className="bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 mt-15">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight max-w-4xl mt-15">
            Just Input Your Location &amp; Find
          </h1>
          <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-tight max-w-4xl mt-3">
            <span
              className="italic font-bold text-white relative inline-block"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Important
              {/* Red underline squiggle */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 5 Q50 0 100 5 Q150 10 200 5"
                  stroke="#ef4444"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </span>
            
            {" "}&amp; Exciting Spots
          </h2>

          <p className="text-gray-300 mt-6 text-base max-w-lg">
            You'll get comprehensive results based on the provided location.
          </p>

          {/* Search bar */}
          <div className="mt-8 flex items-center bg-white rounded-full shadow-xl px-5 py-3 w-full max-w-2xl gap-3">
            <Search size={20} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="What are you looking for?"
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
            <div className="w-px h-6 bg-gray-200" />
            <MapPin size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Location"
              className="w-32 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
            <ChevronDown size={16} className="text-gray-400 shrink-0" />
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors shrink-0">
              Search places
            </button>
          </div>
        </div>
      </section>

      {/* ── Featured Categories Section ── */}
      <section className="bg-[#f7f3ef] py-20 px-6">
        <div className="text-center mb-12">
          <p
            className="text-orange-500 text-3xl mb-2"
            style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}
          >
            Let's Explore!
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900">Featured Categories</h2>
          <p className="text-gray-500 mt-3 text-sm">
            Discover exciting categories.{" "}
            <span className="text-orange-500 font-medium">Find what you're looking for.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-white rounded-2xl px-10 py-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="text-orange-500">{cat.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-base">{cat.name}</p>
                  <p className="text-gray-400 text-sm">{cat.count}</p>
                </div>
              </div>
              <ArrowUpRight
                size={18}
                className="text-gray-300 group-hover:text-orange-500 transition-colors"
              />
            </div>
          ))}
        </div>
      </section>
      <div className="bg-gray-100 w-full h-100 drop-shadow-2xl">
        <h2 className="text-orange-500 font-semibold text-center text-2xl">
          Places</h2>
          <div>
             <h1 className="text-center text-black font-bold text-4xl">Discover your favourite place</h1>
          </div>
          <p className="text-black font-extralight">Discover exciting categories.</p>
      </div>
    </div>
  )
}

export default HomePage