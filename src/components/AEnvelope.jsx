import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Envelope Images
import envelopeClosed from '../assets/envelope_closed.png'
import envelopeOpened from '../assets/envelope_opened.png'

// NEW: Note card decoration images
import dash1 from '../assets/dash1.png'
import dash3 from '../assets/dash3.png'

// --- 1. UPDATED AI QUOTE GENERATOR (NOW WITH ARRAYS) ---
const aiQuotes = {
  Menstrual: [
    "Be gentle with yourself. Your body is doing important work. Rest, nourish, and honor your need for quiet.",
    "A hot water bottle and your favorite movie sound perfect right now. It's okay to slow down.",
    "Listen to your body's cravings. A little dark chocolate can be a great mood-booster!",
    "Your energy is like the tide. It's okay for it to be low right now. Be kind to yourself."
  ],
  Follicular: [
    "Your energy is returning! This is a great time for new beginnings. What new idea do you want to explore?",
    "You might feel more creative and social. It's a great day to plan something fun!",
    "Like spring, your body is in a phase of renewal. Enjoy this fresh start!",
    "A great day for a brisk walk. Your body is building energy, so enjoy the movement."
  ],
  Ovulation: [
    "You are glowing! Your social energy is at its peak. It's a wonderful time to connect, create, and be seen.",
    "You're likely feeling confident and strong today. Channel that energy into something you love.",
    "This is your 'power phase'! You might feel more productive and articulate. Go for it!",
    "A perfect day to connect with friends or a loved one. Your communication skills are shining!"
  ],
  Luteal: [
    "It's time to wind down. Listen to your body's cues for comfort. A little self-care goes a long way.",
    "Feeling a bit tired or irritable? That's totally normal. Be patient with yourself and others.",
    "Your body is craving comfort. Think cozy socks, a warm drink, and your favorite book.",
    "It's okay to say 'no' to extra plans. This is the perfect time to rest and recharge before your next cycle."
  ],
  Loading: "Loading your daily wisdom..."
}
// ------------------------------------

function AEnvelope({ phaseInfo }) {
  const [isOpen, setIsOpen] = useState(false)
  const [quote, setQuote] = useState("")

  useEffect(() => {
    setIsOpen(false)
    setQuote(aiQuotes.Loading)

    const timer = setTimeout(() => {
      // --- 2. UPDATED RANDOM MESSAGE LOGIC ---
      const phaseName = phaseInfo.name || 'Luteal' // Default to Luteal if needed
      
      // Check if the phase exists and has messages
      if (aiQuotes[phaseName] && Array.isArray(aiQuotes[phaseName])) {
        const messages = aiQuotes[phaseName]
        // Pick a random message from the array
        const randomIndex = Math.floor(Math.random() * messages.length)
        setQuote(messages[randomIndex])
      } else {
        // Fallback for 'Loading' or other states
        setQuote(aiQuotes.Loading)
      }
      // --- END OF UPDATE ---
    }, 500)

    return () => clearTimeout(timer)
  }, [phaseInfo.name, phaseInfo.dayOfCycle])

  const handleOpen = () => {
    if (!isOpen) setIsOpen(true)
  }

  return (
    <div className="flex flex-col items-center justify-center mt-12 mb-8">

      {/* Envelope + Card Container */}
      <div className="relative w-[420px] h-96 flex items-center justify-center" onClick={handleOpen}>

        {/* NOTE CARD */}
        <motion.div
          className="absolute bottom-10 w-[420px] h-[260px] bg-white rounded-2xl shadow-xl p-8 z-10 flex items-center justify-center relative overflow-hidden"
          initial={{ y: 40, opacity: 0, scale: 0.8 }}
          animate={{
            y: isOpen ? -200 : 40,
            opacity: isOpen ? 1 : 0,
            scale: isOpen ? 1 : 0.8,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >

          {/* Top-left decoration */}
          <motion.img
            src={dash1}
            alt=""
            className="absolute top-2 left-2 w-16 opacity-80 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 0.8 : 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />

          {/* Bottom-right decoration */}
          <motion.img
            src={dash3}
            alt=""
            className="absolute bottom-2 right-2 w-16 opacity-80 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 0.8 : 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />

          {/* This div adds the lines */}
          <div className="note-lines"></div>

          <p className="font-sans text-lg text-center text-yellow-900 leading-relaxed z-20 relative">
            {quote}
          </p>
        </motion.div>

        {/* ENVELOPE */}
        <motion.img
          src={isOpen ? envelopeOpened : envelopeClosed}
          alt="Envelope"
          className="absolute bottom-0 w-96 cursor-pointer z-20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />

      </div>

      <p className="mt-3 text-gray-700 text-sm font-sans">
        {isOpen ? "Here's your note 💌" : "Tap the envelope for your daily note ✨"}
      </p>
    </div>
  )
}

export default AEnvelope