'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Add scroll event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 50)
    })
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#482B66] shadow-lg' : 'bg-transparent'
      }`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0">
              <Image
                src="/images/LOGO.webp"
                alt="Propelio Logo"
                width={150}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
            <div className="hidden sm:flex sm:gap-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-semibold ${
                    isScrolled ? 'text-white hover:text-[#EA4C4A]' : 'text-white/90 hover:text-white'
                  } transition-colors`}
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-x-4">
              <a href="#login" className={`text-sm font-semibold ${
                isScrolled ? 'text-white hover:text-[#EA4C4A]' : 'text-white/90 hover:text-white'
              } transition-colors`}>Log in</a>
              <a href="#signup" className="rounded-full bg-[#EA4C4A] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
                Sign up
              </a>
            </div>
          </div>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50"></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#482B66] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <Image
                  src="/images/LOGO.webp"
                  alt="Propelio Logo"
                  width={150}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="#login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-white hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </a>
                  <a
                    href="#signup"
                    className="mt-2 -mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-white hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 