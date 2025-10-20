import Link from 'next/link'
import Image from 'next/image'

const featuredVehicles = [
  {
    id: 1,
    year: 2020,
    make: 'Honda',
    model: 'Civic',
    trim: 'LX',
    price: 18995,
    miles: 45000,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop',
    features: ['Automatic', 'Bluetooth', 'Backup Camera'],
    condition: 'Excellent'
  },
  {
    id: 2,
    year: 2019,
    make: 'Toyota',
    model: 'Camry',
    trim: 'LE',
    price: 21995,
    miles: 38000,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop',
    features: ['Automatic', 'Lane Assist', 'Cruise Control'],
    condition: 'Very Good'
  },
  {
    id: 3,
    year: 2021,
    make: 'Nissan',
    model: 'Altima',
    trim: 'SV',
    price: 23995,
    miles: 25000,
    image: 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=500&h=300&fit=crop',
    features: ['CVT', 'Apple CarPlay', 'Heated Seats'],
    condition: 'Like New'
  }
]

export default function FeaturedVehicles() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Vehicles
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Quality cars at great prices. All vehicles come with our satisfaction guarantee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="relative h-64">
                <Image
                  src={vehicle.image}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                  ${vehicle.price.toLocaleString()}
                </div>
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  {vehicle.condition}
                </div>
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                  {vehicle.miles.toLocaleString()} miles
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                </h3>

                <div className="flex flex-wrap gap-2 mb-6">
                  {vehicle.features.map((feature, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/inventory/${vehicle.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/contact?vehicle=${vehicle.id}`}
                    className="flex-1 border-2 border-blue-600 text-blue-600 text-center py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-semibold"
                  >
                    Schedule Drive
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 rounded-xl shadow-lg">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to find your next car?</h3>
            <p className="text-xl text-blue-100 mb-8">Explore our full inventory and drive away happy!</p>
            <Link
              href="/inventory"
              className="bg-white text-blue-800 px-10 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              View All Inventory →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}