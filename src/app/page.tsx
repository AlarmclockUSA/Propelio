'use client'

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import Footer from '@/components/Footer';

// Helper function to position logos in a circle
const getInitialPosition = (index: number) => {
  const totalItems = 15;
  const radius = 250; // Adjust this value to change the circle size
  const angle = (index * 2 * Math.PI) / totalItems;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  
  return `translate-x-[${x}px] translate-y-[${y}px]`;
};

// Helper function to get random position
const getRandomPosition = (index: number) => {
  const angle = Math.random() * 2 * Math.PI;
  const distance = 200 + Math.random() * 300; // Random distance between 200 and 500px
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  return { x, y };
};

// Helper function to get circle position
const getCirclePosition = (index: number, totalItems: number, radius: number) => {
  const angle = (index * 2 * Math.PI) / totalItems;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return { x, y };
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const networkSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);

      // Handle network visualization animation
      if (networkSectionRef.current) {
        const rect = networkSectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Invert the progress calculation so it starts when scrolling towards the logo
        const progress = Math.max(0, Math.min(1, (rect.top / (viewportHeight * 0.7))));
        
        // Only animate when section is in view
        if (progress >= 0 && progress <= 1) {
          const icons = networkSectionRef.current.querySelectorAll('[data-index]');
          icons.forEach((icon) => {
            const element = icon as HTMLElement;
            const index = parseInt(element.dataset.index || '0');
            const delay = index * 0.15;
            
            // Calculate circle position with fixed radius
            const angle = (index * 2 * Math.PI) / 15;
            const radius = 300; // Fixed radius for all states
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            let currentX, currentY, scale, opacity;
            
            if (progress < 0.5) {
              // Phase 1: Maintain circle formation (0-50%)
              currentX = x;
              currentY = y;
              scale = 1;
              opacity = 1;
            } else {
              // Phase 2: Collapse under logo (50-100%)
              const t = (progress - 0.5) / 0.5;
              const easeT = 1 - Math.pow(1 - t, 3);
              
              // Calculate stacked position (centered)
              const stackOffset = index * 4;
              
              // Interpolate between circle position and stacked position
              currentX = x * (1 - easeT);
              currentY = y * (1 - easeT) + stackOffset * easeT;
              scale = 1 - (0.02 * index * easeT);
              opacity = 1 - (0.02 * index * easeT);
            }
            
            element.style.transition = `all ${1.5 + delay}s cubic-bezier(0.34, 1.56, 0.64, 1)`;
            element.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(${scale})`;
            element.style.opacity = opacity.toString();
            element.style.zIndex = progress < 0.5 ? `${50 + index}` : `${15 - index}`;
          });
        }
      }
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

  return (
    <div className="relative bg-[#482B66]">
      {/* Background Animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[1] opacity-70"
      />
      
      {/* Light Beams */}
      <div className="absolute inset-0 z-[2] overflow-hidden">
        {/* Top-left beam */}
        <div 
          className="absolute -top-[20%] -left-[10%] w-[45%] h-[80%] rotate-[15deg] transform animate-float-slow"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0) 100%)',
            filter: 'blur(60px)',
            borderRadius: '100%',
          }}
        />
        {/* Top-right beam */}
        <div 
          className="absolute -top-[10%] right-[5%] w-[45%] h-[80%] rotate-[-15deg] transform animate-float"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0) 100%)',
            filter: 'blur(60px)',
            borderRadius: '100%',
          }}
        />
        {/* Center-left beam */}
        <div 
          className="absolute top-[30%] -left-[5%] w-[40%] h-[70%] rotate-[-35deg] transform animate-float-slower"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0) 100%)',
            filter: 'blur(60px)',
            borderRadius: '100%',
          }}
        />
        {/* Center-right beam */}
        <div 
          className="absolute top-[20%] right-[10%] w-[40%] h-[70%] rotate-[35deg] transform animate-float-slow"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0) 100%)',
            filter: 'blur(60px)',
            borderRadius: '100%',
          }}
        />
        {/* Center beam */}
        <div 
          className="absolute top-[40%] left-[30%] w-[40%] h-[60%] rotate-[15deg] transform animate-float"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 60%, rgba(255,255,255,0) 100%)',
            filter: 'blur(80px)',
            borderRadius: '100%',
          }}
        />
      </div>
      
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 z-[3]"
        style={{
          background: 'linear-gradient(135deg, rgba(72, 43, 102, 0.05) 0%, rgba(72, 43, 102, 0.1) 100%)'
        }}
      />
      
      {/* Radial gradient behind text */}
      <div 
        className="absolute inset-0 z-[4]"
        style={{
          background: 'radial-gradient(50% 50% at 50% 50%, rgba(72, 43, 102, 0.15) 0%, rgba(72, 43, 102, 0) 100%)'
        }}
      />

      {/* Hero content */}
      <div className="relative z-[10] px-6 lg:px-8">
        <div className="mx-auto max-w-7xl pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-left lg:pr-12">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Stop Losing Deals.{' '}
                <span className="text-[#EA4C4A]">Start Using Propelio</span>
              </h1>
              <p className="mt-8 text-xl sm:text-2xl leading-relaxed text-white/90">
                Tired of juggling multiple tools and losing leads? Propelio is the all-in-one solution to automate your business, generate more qualified leads, and dramatically increase your close rate.
              </p>

              {/* Email Input */}
              <div className="mt-12 max-w-md">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-6 py-4 bg-white/10 border border-white/20 text-white rounded-full outline-none placeholder:text-white/40 focus:bg-white/15 transition-colors"
                  />
                  <button className="px-8 py-4 text-[#482B66] font-semibold rounded-full bg-white hover:bg-white/90 transition-colors shadow-xl whitespace-nowrap">
                    Start now →
                  </button>
                </div>
              </div>

              {/* Integration Icons */}
              <div className="mt-20">
                <p className="text-white/60 text-sm mb-8">Trusted by leading companies worldwide</p>
                <div className="flex flex-wrap gap-8 items-center">
                  <Image src="/Layer 2.png" alt="Integration 1" width={100} height={32} className="opacity-70 hover:opacity-100 transition-opacity" />
                  <Image src="/Layer 3.png" alt="Integration 2" width={100} height={32} className="opacity-70 hover:opacity-100 transition-opacity" />
                  <Image src="/Layer 4.png" alt="Integration 3" width={100} height={32} className="opacity-70 hover:opacity-100 transition-opacity" />
                  <Image src="/Layer 5.png" alt="Integration 4" width={100} height={32} className="opacity-70 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Right Column - Interface Mockup */}
            <div className="relative w-screen lg:w-[200%] right-0">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#EA4C4A]/10 via-[#482B66]/5 to-transparent rounded-[3rem] blur-3xl transform scale-90 translate-x-20 translate-y-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/5 to-transparent rounded-[3rem] blur-2xl transform scale-95 translate-x-10 translate-y-10" />
              
              <div className="relative w-full">
                <Image
                  src="/interface-mockup.png"
                  alt="Propelio Interface"
                  width={2400}
                  height={1800}
                  className="w-full h-auto relative z-10"
                  priority
                />
                {/* Gradient overlay on the mockup */}
                <div className="absolute inset-0 z-20 bg-gradient-to-tr from-[#482B66]/20 via-transparent to-transparent pointer-events-none" />
                
                {/* Subtle inner shadow */}
                <div className="absolute inset-0 z-30 bg-gradient-to-b from-black/10 via-transparent to-transparent opacity-30 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Integration Visualization */}
      <div ref={networkSectionRef} className="relative py-32 overflow-hidden bg-[#482B66]/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-8">
            Find, Connect, Close—All in One Platform
          </h2>
          <p className="text-center text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-24">
            Effortlessly manage your entire business, generate more leads, and close more deals with our powerful all-in-one platform
          </p>
          
          <div className="relative h-[800px] w-full">
            {/* Data Flow Lines Container */}
            <div className="absolute inset-0 z-30">
              {[...Array(15)].map((_, index) => {
                const angle = (index * 2 * Math.PI) / 15;
                const radius = 300;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                // Calculate the path from icon to center
                const startX = x + 400; // Adjust based on container width
                const startY = y + 400; // Adjust based on container height
                const endX = 400; // Center X
                const endY = 400; // Center Y
                
                return (
                  <svg
                    key={`path-${index}`}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ zIndex: 30 + index }}
                  >
                    <defs>
                      <linearGradient
                        id={`gradient-${index}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          style={{
                            stopColor: '#EA4C4A',
                            stopOpacity: 0.2,
                          }}
                        />
                        <stop
                          offset="50%"
                          style={{
                            stopColor: '#EA4C4A',
                            stopOpacity: 0.8,
                          }}
                        >
                          <animate
                            attributeName="offset"
                            values="0;1"
                            dur={`${2 + index * 0.2}s`}
                            repeatCount="indefinite"
                          />
                        </stop>
                        <stop
                          offset="100%"
                          style={{
                            stopColor: '#EA4C4A',
                            stopOpacity: 0.2,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${(startY + endY) / 2} ${endX} ${endY}`}
                      fill="none"
                      stroke={`url(#gradient-${index})`}
                      strokeWidth="2"
                      className="opacity-50"
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        values="0,1000;1000,0"
                        dur={`${3 + index * 0.2}s`}
                        repeatCount="indefinite"
                      />
                    </path>
                  </svg>
                );
              })}
            </div>

            {/* Central Propelio Logo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-48 h-48 bg-gradient-to-br from-[#EA4C4A] to-[#482B66] rounded-full 
                          flex items-center justify-center z-50
                          before:content-[''] before:absolute before:inset-0 
                          before:bg-gradient-to-tr before:from-white/20 before:to-transparent 
                          before:rounded-full before:animate-spin before:duration-[10000ms]">
              <div className="relative bg-white/10 rounded-full p-6 backdrop-blur-sm w-full h-full flex items-center justify-center">
                <Image
                  src="/D-Logo-All-1.png"
                  alt="Propelio"
                  width={120}
                  height={120}
                  className="w-32 h-32 object-contain"
                />
              </div>
            </div>

            {/* Tool Nodes Container */}
            <div className="absolute inset-0">
              {[...Array(15)].map((_, index) => {
                const angle = (index * 2 * Math.PI) / 15;
                const radius = 300;
                const x = Math.round(Math.cos(angle) * radius);
                const y = Math.round(Math.sin(angle) * radius);
                
                let imageSrc = '';
                switch(index) {
                  case 0:
                    imageSrc = '/dealmachine.png';
                    break;
                  case 1:
                    imageSrc = '/Prodio.png';
                    break;
                  case 2:
                    imageSrc = '/PropStream.png';
                    break;
                  default:
                    imageSrc = `/Layer ${index + 2}.png`;
                }
                
                return (
                  <div
                    key={index}
                    className="group absolute w-20 h-20 transition-all duration-300 transform cursor-pointer hover:z-[100]"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                    }}
                    data-index={index}
                  >
                    {/* Icon Container */}
                    <div className="relative w-full h-full bg-white rounded-full p-3 shadow-lg 
                                  transition-all duration-300 transform group-hover:scale-110 
                                  group-hover:shadow-xl animate-wiggle">
                      <Image
                        src={imageSrc}
                        alt={`Integration ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain transition-all duration-300"
                        priority
                      />
                    </div>

                    {/* Info Box */}
                    <div className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                  transition-all duration-300 transform group-hover:scale-100 scale-95
                                  bg-white rounded-xl shadow-xl p-4 w-64
                                  left-1/2 -translate-x-1/2 mt-4">
                      {/* Arrow */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45" />
                      
                      {/* Content */}
                      <div className="relative">
                        <h4 className="font-bold text-[#482B66] text-lg mb-2">Service Name</h4>
                        <p className="text-sm text-[#1F2937]/90">
                          Placeholder description for the service. This will be replaced with actual copy.
                        </p>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs font-medium text-[#EA4C4A]">Click to learn more →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Animated Background Particles */}
            <div className="absolute inset-0 z-10">
              {[...Array(30)].map((_, index) => {
                // Use deterministic values based on index instead of Math.random()
                const left = `${(index * 3.33) % 100}%`;
                const top = `${(index * 7.5) % 100}%`;
                const duration = 3 + (index % 4);
                const opacity = 0.2 + ((index % 5) * 0.1);
                
                return (
                  <div
                    key={index}
                    className="absolute w-1 h-1 bg-white/40 rounded-full"
                    style={{
                      left,
                      top,
                      opacity,
                      animation: `float-particle-${index % 20} ${duration}s infinite`
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <p className="text-white/80 text-lg mb-8">
              Stop juggling multiple tools. Get everything you need in one place.
            </p>
            <button className="px-8 py-4 bg-[#EA4C4A] text-white rounded-full 
                           hover:bg-[#EA4C4A]/90 transition-all duration-300
                           transform hover:scale-105 hover:shadow-lg hover:shadow-[#EA4C4A]/20">
              Start Your Free Trial
            </button>
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

      {/* Testimonials Section */}
      <div className="relative bg-[#482B66] py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#EA4C4A] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#EA4C4A] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
              Trusted by Real Estate Professionals
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Join thousands of successful investors who have transformed their business with Propelio.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/sam-img1-1.png"
                    alt="Sarah Johnson"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Sarah Johnson</h4>
                  <p className="text-white/60 text-sm">Real Estate Investor</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#FFD580]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-white/80 italic mb-6">
                "Propelio has completely transformed how I analyze properties. The MLS data accuracy and instant comps have helped me close deals faster than ever."
              </p>
              <div className="flex items-center justify-between text-white/60 text-sm">
                <span>Investor since 2021</span>
                <span>Dallas, TX</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/sam-img2.png"
                    alt="Michael Chen"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Michael Chen</h4>
                  <p className="text-white/60 text-sm">Property Developer</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#FFD580]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-white/80 italic mb-6">
                "The all-in-one platform saves me countless hours. Having property data, valuations, and market insights in one place is a game-changer."
              </p>
              <div className="flex items-center justify-between text-white/60 text-sm">
                <span>Investor since 2020</span>
                <span>Austin, TX</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/sam-img3.png"
                    alt="Emily Rodriguez"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Emily Rodriguez</h4>
                  <p className="text-white/60 text-sm">Real Estate Agent</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#FFD580]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-white/80 italic mb-6">
                "The customer support is phenomenal. Any questions I have are answered within minutes, and the training resources have helped me maximize the platform."
              </p>
              <div className="flex items-center justify-between text-white/60 text-sm">
                <span>Investor since 2022</span>
                <span>Houston, TX</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <p className="text-white/60">Customer Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <p className="text-white/60">Support Available</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">15k+</div>
              <p className="text-white/60">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">4.9/5</div>
              <p className="text-white/60">Average Rating</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-20">
            <button className="px-8 py-4 bg-[#EA4C4A] text-white rounded-full 
                           hover:bg-[#EA4C4A]/90 transition-all duration-300
                           transform hover:scale-105 hover:shadow-lg hover:shadow-[#EA4C4A]/20">
              Join Our Community
            </button>
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

      {/* Data Points Section */}
      <div className="relative bg-[#EBBF79] text-white py-32">
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
            <h2 className="text-4xl font-bold tracking-tight text-[#1F2937] sm:text-5xl mb-6">
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

      {/* Testimonials Section */}
      <div className="relative bg-[#482B66] py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#EA4C4A] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#EA4C4A] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
              Trusted by Real Estate Professionals
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Join thousands of successful investors who have transformed their business with Propelio.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/sam-img1-1.png"
                    alt="Sarah Johnson"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Sarah Johnson</h4>
                  <p className="text-white/60 text-sm">Real Estate Investor</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#FFD580]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-white/80 italic mb-6">
                "Propelio has completely transformed how I analyze properties. The MLS data accuracy and instant comps have helped me close deals faster than ever."
              </p>
              <div className="flex items-center justify-between text-white/60 text-sm">
                <span>Investor since 2021</span>
                <span>Dallas, TX</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/sam-img2.png"
                    alt="Michael Chen"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Michael Chen</h4>
                  <p className="text-white/60 text-sm">Property Developer</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#FFD580]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-white/80 italic mb-6">
                "The all-in-one platform saves me countless hours. Having property data, valuations, and market insights in one place is a game-changer."
              </p>
              <div className="flex items-center justify-between text-white/60 text-sm">
                <span>Investor since 2020</span>
                <span>Austin, TX</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/sam-img3.png"
                    alt="Emily Rodriguez"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Emily Rodriguez</h4>
                  <p className="text-white/60 text-sm">Real Estate Agent</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#FFD580]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-white/80 italic mb-6">
                "The customer support is phenomenal. Any questions I have are answered within minutes, and the training resources have helped me maximize the platform."
              </p>
              <div className="flex items-center justify-between text-white/60 text-sm">
                <span>Investor since 2022</span>
                <span>Houston, TX</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <p className="text-white/60">Customer Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <p className="text-white/60">Support Available</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">15k+</div>
              <p className="text-white/60">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">4.9/5</div>
              <p className="text-white/60">Average Rating</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-20">
            <button className="px-8 py-4 bg-[#EA4C4A] text-white rounded-full 
                           hover:bg-[#EA4C4A]/90 transition-all duration-300
                           transform hover:scale-105 hover:shadow-lg hover:shadow-[#EA4C4A]/20">
              Join Our Community
            </button>
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

      {/* Property Data Section */}
      // ... existing code ...

      {/* Marketing Section */}
      <div className="relative bg-white py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-[#1F2937] sm:text-5xl mb-6">
              Seamless Marketing: <span className="text-[#EA4C4A]">Turning Insights into Closed Deals</span>
            </h2>
            <p className="text-xl text-[#1F2937]/70 max-w-3xl mx-auto">
              Propelio seamlessly connects intelligence to action. Once you've identified a high-potential lead or property, our built-in marketing tools empower you to:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Card 1 */}
            <div className="bg-[#F0F7FF] rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#EA4C4A]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#EA4C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#482B66] mb-4">Launch Targeted Campaigns</h3>
              <p className="text-[#1F2937]/70">
                Create personalized email and SMS sequences that speak directly to the needs and interests of your prospects, based on the insights you've gained from Propelio's data.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FFF0F0] rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#EA4C4A]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#EA4C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#482B66] mb-4">High-Converting Sales Funnels</h3>
              <p className="text-[#1F2937]/70">
                Guide leads through the buying or selling process with automated funnels that leverage our market intelligence. Each step is optimized for conversion.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F0FFE9] rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#EA4C4A]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#EA4C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#482B66] mb-4">SEO-Optimized Website</h3>
              <p className="text-[#1F2937]/70">
                Generate organic leads with ease. Propelio's website builder allows anyone to easily create a website optimized to capture consistent organic traffic.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#F0F7FF] rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#EA4C4A]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#EA4C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#482B66] mb-4">Automated Follow-Up</h3>
              <p className="text-[#1F2937]/70">
                Never miss an opportunity. Propelio's automated reminders and tasks ensure you stay top-of-mind with every prospect, nurturing them towards a closed deal.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-[#FFF0F0] rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#EA4C4A]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#EA4C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#482B66] mb-4">Direct Homeowner Marketing</h3>
              <p className="text-[#1F2937]/70">
                Identify the homeowners most likely to sell, and use our automations to connect with them directly and effectively.
              </p>
            </div>
          </div>

          {/* Example Box */}
          <div className="bg-[#482B66] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#EA4C4A]/10 to-transparent"></div>
            <h3 className="text-2xl font-bold mb-6">See It In Action</h3>
            <p className="text-lg text-white/80 mb-8 max-w-3xl">
              Imagine this: You use Propelio's comps to identify a neighborhood with rapidly appreciating values. Within minutes, you've launched a targeted email campaign to homeowners in that area, highlighting the potential profit they could realize by selling now. That's the power of intelligence-driven marketing.
            </p>
            <button className="px-8 py-4 bg-[#EA4C4A] text-white rounded-full hover:bg-[#EA4C4A]/90 transition-all duration-300 transform hover:scale-105">
              Try It Now
            </button>
          </div>
        </div>
      </div>

      {/* Wave Shape Divider */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 w-full overflow-hidden rotate-180">
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
