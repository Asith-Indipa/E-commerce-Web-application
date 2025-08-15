import { Link } from "react-router-dom";
import { Car, Bike, Truck, Bus, ArrowRight } from "lucide-react";

export default function Home() {
  // Sample featured vehicles data
  const featuredVehicles = [
    {
      id: 1,
      title: "Toyota Aqua 2015",
      price: "Rs 4,500,000",
      location: "Colombo",
      image: "https://example.com/toyota-aqua.jpg" // Replace with actual image URL
    },
    {
      id: 2,
      title: "Honda Vezel 2017",
      price: "Rs 6,800,000",
      location: "Kandy",
      image: "https://example.com/honda-vezel.jpg"
    },
    {
      id: 3,
      title: "Suzuki Wagon R 2018",
      price: "Rs 3,200,000",
      location: "Galle",
      image: "https://example.com/suzuki-wagonr.jpg"
    },
    {
      id: 4,
      title: "Nissan Sunny 2016",
      price: "Rs 3,900,000",
      location: "Negombo",
      image: "https://example.com/nissan-sunny.jpg"
    }
  ];

  // Vehicle categories
  const categories = [
    { name: "Cars", icon: <Car size={24} />, count: 1245 },
    { name: "Motorcycles", icon: <Bike size={24} />, count: 876 },
    { name: "Vans & Trucks", icon: <Truck size={24} />, count: 342 },
    { name: "Buses", icon: <Bus size={24} />, count: 156 }
  ];

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="relative bg-blue-50 pt-24 pb-10 sm:pt-32 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Your Perfect Vehicle
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Browse thousands of new and used vehicles for sale across Sri Lanka
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/vehicles?category=${category.name.toLowerCase()}`}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex items-center"
              >
                <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-3">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-base sm:text-lg">{category.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{category.count} listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-6 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Vehicles</h2>
            <Link to="/vehicles" className="flex items-center text-blue-600 hover:text-blue-800 text-sm sm:text-base">
              View all <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-40 sm:h-48 bg-gray-200 flex items-center justify-center w-full">
                  {/* Replace with actual image */}
                  <span className="text-gray-400 text-xs sm:text-base">Vehicle Image</span>
                </div>
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <h3 className="font-medium text-base sm:text-lg text-gray-900 mb-1">{vehicle.title}</h3>
                  <p className="text-blue-600 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{vehicle.price}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{vehicle.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">Why Choose VehicleMart?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Verified Listings</h3>
              <p className="text-gray-600 text-xs sm:text-base">All vehicles go through our verification process</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Best Prices</h3>
              <p className="text-gray-600 text-xs sm:text-base">We help you find the best deals in the market</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-xs sm:text-base">Our team is always ready to assist you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 sm:py-12 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">Ready to sell your vehicle?</h2>
          <p className="text-blue-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-xs sm:text-base">
            List your vehicle with us and reach thousands of potential buyers
          </p>
          <Link
            to="/sell"
            className="inline-block bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-100 transition text-sm sm:text-base"
          >
            Sell Your Vehicle Now
          </Link>
        </div>
      </section>
    </div>
  );
}