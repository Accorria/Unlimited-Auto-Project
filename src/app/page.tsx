import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import FeaturedVehicles from '@/components/FeaturedVehicles'
import Financing from '@/components/Financing'
import Testimonials from '@/components/Testimonials'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <FeaturedVehicles />
      <Services />
      <Financing />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  )
}