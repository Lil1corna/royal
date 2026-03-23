'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function CinematicHero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#050d1a]">
      {/* Animated Aurora Blobs Behind Image */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(45,155,181,0.4) 0%, transparent 70%)',
            left: '15%',
            top: '20%',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)',
            right: '10%',
            top: '30%',
          }}
          animate={{
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full blur-[120px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(13,59,110,0.5) 0%, transparent 70%)',
            left: '50%',
            bottom: '10%',
            transform: 'translateX(-50%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Hero Image Container with Cinematic Treatment */}
      <div className="relative z-10 w-full max-w-[600px] px-4 sm:px-6">
        <motion.div
          className="hero-image-wrapper relative overflow-hidden"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Product Image */}
          <div className="relative aspect-[3/4]">
            <Image
              src="/royal-matras/Home-49042c46-32d3-4e70-8a88-f13eb9224dc9.png"
              alt="Royal Matras"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 600px"
              className="hero-product-image object-cover"
              style={{
                filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.8))',
              }}
            />

            {/* Radial Spotlight Effect */}
            <div
              className="hero-spotlight absolute pointer-events-none mix-blend-screen"
              style={{
                inset: '-50%',
                background: `radial-gradient(ellipse 50% 40% at 50% 55%,
                  rgba(200, 220, 255, 0.15) 0%,
                  rgba(100, 160, 220, 0.08) 30%,
                  transparent 70%)`,
              }}
            />

            {/* Edge Vignette */}
            <div
              className="hero-vignette absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 90% 80% at 50% 50%,
                  transparent 40%,
                  rgba(5, 13, 26, 0.6) 75%,
                  rgba(5, 13, 26, 0.95) 100%)`,
              }}
            />

            {/* Bottom Fade */}
            <div
              className="hero-bottom-fade absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: '50%',
                background: 'linear-gradient(to top, #050d1a 0%, transparent 100%)',
              }}
            />

            {/* Top Fade */}
            <div
              className="hero-top-fade absolute top-0 left-0 right-0 pointer-events-none"
              style={{
                height: '30%',
                background: 'linear-gradient(to bottom, #050d1a 0%, transparent 100%)',
              }}
            />

            {/* Left Fade */}
            <div
              className="hero-left-fade absolute top-0 left-0 bottom-0 pointer-events-none"
              style={{
                width: '25%',
                background: 'linear-gradient(to right, #050d1a 0%, transparent 100%)',
              }}
            />

            {/* Right Fade */}
            <div
              className="hero-right-fade absolute top-0 right-0 bottom-0 pointer-events-none"
              style={{
                width: '25%',
                background: 'linear-gradient(to left, #050d1a 0%, transparent 100%)',
              }}
            />
          </div>

          {/* Hero Text Overlay */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 text-center z-20 px-4"
            style={{ bottom: '12%' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="font-serif text-white tracking-[0.08em] leading-[0.95] mb-3 sm:mb-4"
              style={{
                fontSize: 'clamp(40px, 8vw, 90px)',
                textShadow: '0 2px 20px rgba(0,0,0,0.8)',
              }}
            >
              Royal Matras
            </h1>
            <p
              className="text-[#c9a84c] font-sans tracking-[0.25em] sm:tracking-[0.3em] uppercase"
              style={{
                fontSize: 'clamp(9px, 2vw, 11px)',
                textShadow: '0 2px 20px rgba(0,0,0,0.8)',
              }}
            >
              MATRAS · YASTIQ · YORĞAN
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M12 19L6 13M12 19L18 13"
              stroke="#c9a84c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
