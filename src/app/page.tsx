'use client'

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import dynamic from 'next/dynamic';
import Footer from '@/components/Footer';

const Plyr = dynamic(() => import('plyr-react'), {
  ssr: false,
});

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [email, setEmail] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      const particles: Particle[] = [];
      // Fewer particles for clearer visualization
      const numParticles = Math.floor((canvas.width * canvas.height) / 40000);

      // Create a grid-like distribution
      const gridSize = Math.sqrt(numParticles);
      const cellWidth = canvas.width / gridSize;
      const cellHeight = canvas.height / gridSize;

      for (let i = 0; i < numParticles; i++) {
        // Add some randomness to grid positions
        const gridX = Math.floor(i % gridSize);
        const gridY = Math.floor(i / gridSize);
        
        particles.push({
          x: (gridX * cellWidth) + (Math.random() * cellWidth * 0.5),
          y: (gridY * cellHeight) + (Math.random() * cellHeight * 0.5),
          vx: (Math.random() - 0.5) * 0.2, // Slower movement
          vy: (Math.random() - 0.5) * 0.2,
          radius: 2, // Consistent size
        });
      }
      particlesRef.current = particles;
    };
    initParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges instead of bouncing
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle (smaller, more subtle)
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(72, 43, 102, 0.2)';
        ctx.fill();

        // Connect particles with lines
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const other = particlesRef.current[j];
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Increased connection distance but with opacity falloff
          if (distance < 200) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            
            // Stronger lines that fade with distance
            const opacity = 0.2 * (1 - distance / 200);
            ctx.strokeStyle = `rgba(72, 43, 102, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const videoOptions = {
    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
    settings: [],
    clickToPlay: true,
    hideControls: true,
    resetOnEnd: true,
    quality: {
      default: 1080,
      options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
    }
  };

  const videoSource = {
    type: 'video' as const,
    sources: [
      {
        src: 'i88II9fQveE',
        provider: 'youtube'
      }
    ]
  };

  return (
    <div className="relative bg-[#482B66]">
      {/* Background Animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[1] opacity-70"
      />
      
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 z-[2]"
        style={{
          background: 'linear-gradient(135deg, rgba(72, 43, 102, 0.05) 0%, rgba(72, 43, 102, 0.1) 100%)'
        }}
      />
      
      {/* Radial gradient behind text */}
      <div 
        className="absolute inset-0 z-[3]"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(72, 43, 102, 0.15) 0%, rgba(72, 43, 102, 0) 100%)'
        }}
      />
      
      {/* Hero content */}
      <div className="relative z-[10] px-6 lg:px-8">
        <div className="mx-auto max-w-5xl pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-44 lg:pb-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Unlimited Access to{' '}
              <span className="text-[#EA4C4A]">MLS Comps</span>{' '}
              For Real Estate Investors
            </h1>
            <p className="mt-8 text-xl sm:text-2xl leading-relaxed text-white/80 max-w-3xl mx-auto">
              At Your Fingertips, Whenever You Need Them, Directly From our Real Estate Brokerage.
            </p>

            {/* Video Section */}
            <div className="mt-12 mx-auto max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl relative">
              {!isPlaying ? (
                <div 
                  className="absolute inset-0 cursor-pointer z-10 w-full h-full"
                  onClick={() => setIsPlaying(true)}
                >
                  {/* Thumbnail */}
          <Image
                    src="https://img.youtube.com/vi/i88II9fQveE/maxresdefault.jpg"
                    alt="Video Thumbnail"
                    fill
                    className="object-cover w-full h-full"
                    priority
                    sizes="(max-width: 896px) 100vw, 896px"
                  />
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[#EA4C4A]/90 flex items-center justify-center transition-transform hover:scale-110">
                      <svg 
                        className="w-10 h-10 text-white ml-1" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Gradient Overlay */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-[#482B66]/50 to-transparent pointer-events-none"
                  />
                </div>
              ) : (
                <Plyr
                  options={videoOptions}
                  source={videoSource}
                />
              )}
            </div>

            {/* Email Capture Section */}
            <div className="mt-12 mx-auto max-w-md">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-full shadow-xl">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
                />
                <button className="px-8 py-3 text-white font-semibold rounded-full bg-[#EA4C49] hover:opacity-90 transition-opacity">
                  Get Started
                </button>
              </div>
              
              {/* Star Rating */}
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-[#EA4C4A]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white text-sm">
                  4.8 out of 5 stars in over 5,000 reviews
                </span>
              </div>
            </div>

            {/* Trusted by section */}
            <div className="mt-20">
              <p className="text-sm font-semibold text-white/70 mb-8">
                The early adopters, moving forward with the strength of Propelio:
              </p>
              <div className="mx-auto grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 max-w-lg opacity-90">
                <div className="flex justify-center items-center">
                  <p className="text-white font-bold">Titanium Investments</p>
                </div>
                <div className="flex justify-center items-center">
                  <p className="text-white font-bold">HomeVestors</p>
                </div>
                <div className="flex justify-center items-center">
                  <p className="text-white font-bold">Keller Williams</p>
                </div>
                <div className="flex justify-center items-center">
                  <p className="text-white font-bold">KeyGlee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Shape Divider */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180">
          <svg
            className="relative block w-full h-[60px] md:h-[120px]"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-[#FFCF77]"
            />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-white py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-[#1F2937] sm:text-5xl">
              Real Estate Investing made{' '}
              <span className="text-[#EA4C4A]">simple, powerful, and affordable</span>
            </h2>
            <p className="mt-6 text-lg text-[#1F2937]/70 max-w-3xl mx-auto">
              Crafted by a team of real estate brokers and investors, powered by premium MLS data.
            </p>
            
            <div className="mt-8 flex justify-center">
              <button className="px-8 py-4 text-white font-semibold rounded-full bg-[#EA4C4A] hover:opacity-90 transition-opacity text-lg shadow-lg shadow-[#EA4C4A]/20">
                Get Started Now
              </button>
            </div>

            <Image
              src="/images/mls-comps-interface.png"
              alt="MLS Comps Interface"
              width={1200}
              height={800}
              className="mt-12 rounded-xl"
              priority
            />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Property Research Card */}
            <div className="bg-[#F0F7FF] rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-[#482B66] mb-4">PROPERTY RESEARCH</h3>
              <p className="text-[#1F2937]/70 mb-8 text-lg">
                With more than 153 million properties in our database, you can complete your due diligence in minutes rather than hours.
              </p>
              <button className="inline-flex items-center text-[#EA4C4A] font-semibold hover:opacity-80 transition-opacity">
                LEARN MORE →
              </button>
            </div>

            {/* MLS Valuations Card */}
            <div className="bg-[#FFF0F0] rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-[#482B66] mb-4">MLS VALUATIONS</h3>
              <p className="text-[#1F2937]/70 mb-8 text-lg">
                Sales and Rental comps are available instantly, 24/7, with direct-to-MLS data, updated every 15 minutes.
              </p>
              <button className="inline-flex items-center text-[#EA4C4A] font-semibold hover:opacity-80 transition-opacity">
                LEARN MORE →
              </button>
            </div>

            {/* Scale As You Grow Card */}
            <div className="bg-[#F0FFE9] rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-[#482B66] mb-4">SCALE AS YOU GROW</h3>
              <p className="text-[#1F2937]/70 mb-8 text-lg">
                Our pricing plans are tailored to fit beginners as well as advanced users so that you can afford to grow with Propelio.
              </p>
              <button className="inline-flex items-center text-[#EA4C4A] font-semibold hover:opacity-80 transition-opacity">
                LEARN MORE →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Points Section */}
      <div className="relative bg-[#0072CE] text-white py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              We turn trillions of real estate data points<br />
              into marketing and investment decisions
            </h2>
            <p className="text-lg text-white/80">
              Multi-source data from county records, tax accessors, local courts, USPS, and directly from the MLS.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20">
            {/* Left Column - Checkmarks */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 mt-1">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg">Sales and Rentals with photos for 104 MLS Markets</p>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 mt-1">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg">Get More Contracts w/ Accurate MLS Data Updated Every 15 Minutes</p>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 mt-1">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg">Property & Owner Data for 3,143 U.S. Counties</p>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 mt-1">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg">More than 700M Contacts to Find and Connect with Owners in seconds</p>
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="text-3xl font-bold text-green-400 mb-2">1.1 Million</div>
                <p className="text-white/80">Comparable Sales Reports Created</p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="text-3xl font-bold text-green-400 mb-2">51 Million</div>
                <p className="text-white/80">Sales and Rental Listings Available</p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="text-3xl font-bold text-green-400 mb-2">445 Million</div>
                <p className="text-white/80">MLS Listing Photos</p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="text-3xl font-bold text-green-400 mb-2">153 Million</div>
                <p className="text-white/80">Property and Owner Records</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-16">
            <button className="px-8 py-4 bg-[#FFD580] text-[#482B66] font-semibold rounded-full hover:opacity-90 transition-opacity">
              GET STARTED
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors">
              SEE COVERAGE
            </button>
          </div>
        </div>

        {/* Wave Shape Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-[5]">
          <svg
            className="relative block w-full h-[60px] md:h-[120px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-[#E9E7EC]"
              transform="rotate(180) translate(-1200, -120)"
            />
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative bg-white py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-[#1F2937] sm:text-5xl mb-6">
              Your Valuations Simplified: We've Got Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mt-20">
              <div className="bg-[#F0F7FF] rounded-3xl p-8 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-6xl font-bold text-[#EA4C4A] mb-6">17M+</div>
                <p className="text-[#482B66] text-xl">Active and Sold Listings</p>
              </div>
              <div className="bg-[#FFF0F0] rounded-3xl p-8 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-6xl font-bold text-[#EA4C4A] mb-6">3.4M+</div>
                <p className="text-[#482B66] text-xl">Active and Leased Rentals</p>
              </div>
              <div className="bg-[#F0FFE9] rounded-3xl p-8 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-6xl font-bold text-[#EA4C4A] mb-6">454M+</div>
                <p className="text-[#482B66] text-xl">Quality MLS Listing Photos</p>
              </div>
            </div>
            <div className="mt-12 flex justify-center">
              <button className="px-8 py-4 text-white font-semibold rounded-full bg-[#EA4C4A] hover:opacity-90 transition-opacity text-lg shadow-lg shadow-[#EA4C4A]/20">
                Start Your Valuation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Wave Divider for Workflow Section */}
      <div className="relative bg-white">
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden">
          <svg
            className="relative block w-full h-[60px] md:h-[120px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              className="fill-[#FFCF77]"
              opacity=".25"
              transform="rotate(180) translate(-1200, -120)"
            />
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              className="fill-[#FFCF77]"
              opacity=".5"
              transform="rotate(180) translate(-1200, -120)"
            />
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="fill-[#FFCF77]"
              transform="rotate(180) translate(-1200, -120)"
            />
          </svg>
        </div>
      </div>

      {/* Interactive Workflow Section */}
      <div className="relative bg-[#FFCF77] py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="text-[#EA4C4A] text-lg font-semibold mb-4 block">STREAMLINED WORKFLOW</span>
            <h2 className="text-4xl font-bold tracking-tight text-[#1F2937] sm:text-5xl mb-6">
              Find Your Perfect Property Match<br />in Four Easy Steps
            </h2>
            <p className="mt-6 text-xl text-[#1F2937]/70 max-w-3xl mx-auto">
              Our intuitive workflow guides you through the process of finding and analyzing properties with precision and ease.
            </p>
          </div>

          {/* Interactive Steps */}
          <div className="relative mt-20">
            {/* Connection Lines */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#EA4C4A]/20 via-[#EA4C4A] to-[#EA4C4A]/20 transform -translate-y-1/2 hidden lg:block"></div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Step 1: Explore */}
              <div className="relative group">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-[#EA4C4A]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-[#EA4C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#482B66] mb-4">Explore MLS Sales & Leases</h3>
                  <p className="text-[#1F2937]/70 mb-6">
                    Set your criteria and let our smart filters do the heavy lifting. Get detailed, customized comparative market analysis instantly.
                  </p>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#EA4C4A] rounded-full text-white flex items-center justify-center font-bold text-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    01
                  </div>
                </div>
              </div>

              {/* Step 2: Rate */}
              <div className="relative group">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-[#EA4C4A]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-[#EA4C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905 0 .905-.714-.211-1.412-.608-2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#482B66] mb-4">Rate Properties</h3>
                  <p className="text-[#1F2937]/70 mb-6">
                    Quick thumbs up or down voting system helps you build a personalized collection of potential properties.
                  </p>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#EA4C4A] rounded-full text-white flex items-center justify-center font-bold text-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    02
                  </div>
                </div>
              </div>

              {/* Step 3: Compare */}
              <div className="relative group">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-[#EA4C4A]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-[#EA4C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#482B66] mb-4">View Full Report</h3>
                  <p className="text-[#1F2937]/70 mb-6">
                    Access comprehensive side-by-side comparisons with all essential data in a full-screen format.
                  </p>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#EA4C4A] rounded-full text-white flex items-center justify-center font-bold text-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    03
                  </div>
                </div>
              </div>

              {/* Step 4: Analyze */}
              <div className="relative group">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-[#EA4C4A]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-[#EA4C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#482B66] mb-4">Get Insights</h3>
                  <p className="text-[#1F2937]/70 mb-6">
                    Receive a comprehensive report with property features, estimated values, and custom analysis.
                  </p>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#EA4C4A] rounded-full text-white flex items-center justify-center font-bold text-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    04
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Demo Preview */}
            <div className="mt-32 bg-[#F0F7FF] rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#EA4C4A]/5 to-transparent"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-[#482B66] mb-6">See It In Action</h3>
                <p className="text-[#1F2937]/70 text-xl mb-8 max-w-2xl">
                  Watch how easy it is to analyze properties and make data-driven decisions with our intuitive interface.
                </p>
                <button className="inline-flex items-center px-8 py-4 rounded-full bg-[#EA4C4A] text-white font-semibold hover:opacity-90 transition-opacity">
                  Watch Demo
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Divider for Workflow Section */}
      <div className="relative bg-[#FFCF77]">
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden rotate-180">
          <svg
            className="relative block w-full h-[60px] md:h-[120px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              className="fill-white"
              opacity=".25"
            />
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              className="fill-white"
              opacity=".5"
            />
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="fill-white"
            />
          </svg>
        </div>
      </div>

      {/* Services Overview Section */}
      <div className="relative bg-white py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-[#1F2937] sm:text-5xl">
              We've got something for everyone!
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Property Data Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <h3 className="text-xl font-bold text-[#482B66] mb-3 group-hover:text-[#EA4C4A] transition-colors">
                PROPERTY DATA
              </h3>
              <p className="text-[#1F2937]/70 mb-6 text-base">
                Streamlining real estate insights for informed decision-making.
              </p>
              <button className="text-[#EA4C4A] font-semibold text-sm hover:opacity-80 transition-opacity uppercase">
                Learn More
              </button>
            </div>

            {/* MLS Valuation Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <h3 className="text-xl font-bold text-[#482B66] mb-3 group-hover:text-[#EA4C4A] transition-colors">
                MLS VALUATION
              </h3>
              <p className="text-[#1F2937]/70 mb-6 text-base">
                A multiple-listing service comparable tool.
              </p>
              <button className="text-[#EA4C4A] font-semibold text-sm hover:opacity-80 transition-opacity uppercase">
                Learn More
              </button>
            </div>

            {/* Coverage & Brokers Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <h3 className="text-xl font-bold text-[#482B66] mb-3 group-hover:text-[#EA4C4A] transition-colors">
                COVERAGE & BROKERS
              </h3>
              <p className="text-[#1F2937]/70 mb-6 text-base">
                Shows MLS coverage and broker transactions in your state.
              </p>
              <button className="text-[#EA4C4A] font-semibold text-sm hover:opacity-80 transition-opacity uppercase">
                Learn More
              </button>
            </div>

            {/* Listing Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <h3 className="text-xl font-bold text-[#482B66] mb-3 group-hover:text-[#EA4C4A] transition-colors">
                LISTING
              </h3>
              <p className="text-[#1F2937]/70 mb-6 text-base">
                See the latest listings and easily apply to list your own property.
              </p>
              <button className="text-[#EA4C4A] font-semibold text-sm hover:opacity-80 transition-opacity uppercase">
                Learn More
              </button>
            </div>

            {/* Short Sale Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <h3 className="text-xl font-bold text-[#482B66] mb-3 group-hover:text-[#EA4C4A] transition-colors">
                SHORT SALE
              </h3>
              <p className="text-[#1F2937]/70 mb-6 text-base">
                Discover swift short sales – apply to sell effortlessly.
              </p>
              <button className="text-[#EA4C4A] font-semibold text-sm hover:opacity-80 transition-opacity uppercase">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Support Section */}
      <div className="relative bg-white py-32">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#482B66] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#482B66] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#1F2937] sm:text-5xl mb-6">
              Customer Support is Our #1 Priority
            </h2>
            <p className="mt-6 text-xl text-[#1F2937]/70 max-w-3xl mx-auto">
              You will never be left on your own. Our live chat is watched like Fort Knox, and that's why our median response time is under 3 minutes.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-8 py-4 text-white font-semibold rounded-full bg-[#EA4C4A] hover:opacity-90 transition-opacity text-lg shadow-lg shadow-[#EA4C4A]/20 hover:shadow-[#EA4C4A]/30">
                Chat With Us
              </button>
              <button className="px-8 py-4 text-[#1F2937] font-semibold rounded-full border-2 border-[#1F2937]/20 hover:bg-[#1F2937]/5 transition-colors text-lg">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Data Section */}
      <div className="relative bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="relative z-20">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Property Data is common.
                <br />
                <span className="text-[#EA4C4A]">Ours? Elevated.</span>
              </h2>
              <p className="mt-6 text-xl text-[#1F2937]/70">
                Allow us to help you attract quality leads, evaluate investments, and buy more houses.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center px-8 py-4 rounded-full bg-[#EA4C4A] text-white font-semibold hover:opacity-90 transition-opacity">
                  GET STARTED
                </button>
                <button className="inline-flex items-center px-8 py-4 rounded-full border-2 border-[#1F2937]/20 text-[#1F2937] font-semibold hover:bg-[#1F2937]/5 transition-colors">
                  TALK TO SALES
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="relative z-[1] lg:mb-[-120px]">
              <Image
                src="/images/footer-hand.png"
                alt="Propelio App Interface"
                width={500}
                height={700}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>

        {/* Wave Shape Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-[5]">
          <svg
            className="relative block w-full h-[60px] md:h-[120px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-[#E9E7EC]"
              transform="rotate(180) translate(-1200, -120)"
            />
          </svg>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
