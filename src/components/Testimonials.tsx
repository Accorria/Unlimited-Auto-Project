'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      name: 'Sarah Johnson',
      review: 'Amazing experience! The team at Unlimited Auto made buying my first car so easy. They were honest about the vehicle\'s condition and helped me get great financing. I love my Honda Civic!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    },
    {
      name: 'Mike Rodriguez',
      review: 'I\'ve been bringing my cars here for service for years. Their mechanic shop is top-notch and the detailing service made my car look brand new. Highly recommend!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    {
      name: 'Jennifer Chen',
      review: 'The window tinting service was excellent and the staff was very professional. They also helped me find the perfect used car within my budget. Great value for money!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex justify-center mb-4">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <section className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          What Our Customers Say
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Hear directly from those who've experienced the Unlimited Auto difference.
        </p>

        <div className="relative max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8 md:p-12">
          {/* Testimonial Content */}
          <div className="transition-opacity duration-500 ease-in-out">
            {renderStars(testimonials[currentTestimonial].rating)}
            <p className="text-lg md:text-xl text-gray-700 italic mb-6">
              "{testimonials[currentTestimonial].review}"
            </p>
            <p className="text-xl font-semibold text-gray-900">
              - {testimonials[currentTestimonial].name}
            </p>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-blue-600/10 hover:bg-blue-600/30 text-blue-800 p-2 rounded-full transition-colors duration-300"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-blue-600/10 hover:bg-blue-600/30 text-blue-800 p-2 rounded-full transition-colors duration-300"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Testimonial Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-blue-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
