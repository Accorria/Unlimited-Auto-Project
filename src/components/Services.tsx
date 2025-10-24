import Link from 'next/link'

export default function Services() {
  const services = [
    {
      icon: '',
      title: 'Vehicle Sales',
      description: 'Quality used cars with comprehensive inspections and warranties.',
      link: '/inventory'
    },
    {
      icon: '',
      title: 'Auto Repair',
      description: 'Professional mechanical services for all makes and models.',
      link: '/services/repair'
    },
    {
      icon: '',
      title: 'Collision Repair',
      description: 'Expert body work and paint services to restore your vehicle.',
      link: '/services/collision'
    },
    {
      icon: '',
      title: 'Detailing',
      description: 'Premium cleaning and detailing services for your vehicle.',
      link: '/services/detailing'
    },
    {
      icon: '',
      title: 'Window Tinting',
      description: 'Professional window tinting for style and protection.',
      link: '/services/tinting'
    },
    {
      icon: '',
      title: 'Vehicle Wrapping',
      description: 'Custom vinyl wraps and graphics for your vehicle.',
      link: '/services/wrapping'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Additional Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Beyond vehicle sales, we offer comprehensive automotive services to keep your car running perfectly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link
              key={index}
              href={service.link}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-4 text-blue-600 font-semibold group-hover:text-blue-700">
                  Learn More →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            href="/services"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300 shadow-lg"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  )
}
