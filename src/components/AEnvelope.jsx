import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Envelope Images
import envelopeClosed from '../assets/envelope_closed.png'
import envelopeOpened from '../assets/envelope_opened.png'

// Mood / Decorations
import dash1 from '../assets/dash1.png'
import dash3 from '../assets/dash3.png'
import painIcon from '../assets/pain.png'
import happyIcon from '../assets/happy.png'
import notesBg from '../assets/notes-bg.png' // Restored background for note card

// --- GROQ API SETUP ---
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL_NAME = 'llama-3.1-8b-instant'
// --- END GROQ SETUP ---

function AEnvelope({ phaseInfo }) {
  const [isOpen, setIsOpen] = useState(false)
  const [quote, setQuote] = useState('Fetching your daily wisdom...')

  useEffect(() => {
    setIsOpen(false)
    setQuote('Fetching your daily wisdom...')

    const fetchQuote = async () => {
      if (!GROQ_API_KEY) {
        setQuote('⚠️ API Key missing. Please set VITE_GROQ_API_KEY in .env.local.')
        return
      }

      const phaseName = phaseInfo.name || 'Luteal'
      const userPrompt = `Write a short (2–3 sentence) comforting, warm, and encouraging note for someone in their ${phaseName} phase of the menstrual cycle. Avoid greetings or sign-offs. Be kind and empathetic.`

      // Helper for making API calls
      const generateNote = async (modelName) => {
        const response = await fetch(GROQ_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              {
                role: 'system',
                content:
                  'You are a caring and supportive menstrual cycle companion who writes short, warm, comforting notes to help users feel at ease.',
              },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.8,
            max_tokens: 150,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            `Groq API error: ${response.status} - ${
              errorData.error?.message || response.statusText
            }`
          )
        }

        const data = await response.json()
        return data.choices?.[0]?.message?.content?.trim()
      }

      try {
        const note = await generateNote(MODEL_NAME)
        if (note) {
          setQuote(note)
        } else {
          throw new Error('Empty response from model.')
        }
      } catch (error) {
        console.error('Groq Fetch Error:', error)
        setQuote(`Error generating note. The AI service is temporarily unavailable.`)
      }
    }

    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [phaseInfo.name, phaseInfo.dayOfCycle])

  const handleOpen = () => setIsOpen(!isOpen)

  return (
    <div className="flex flex-col items-center justify-center mt-12 mb-8">
      <div className="relative w-[900px] h-96 flex items-center justify-start gap-10">
        {/* ENVELOPE SECTION (Left) */}
        <div
          className="relative left-0 w-[420px] h-96 flex flex-col items-center justify-center"
          onClick={handleOpen}
        >
          <div className="relative w-full h-full flex items-center justify-center pt-20">
            {/* NOTE CARD (Restored Beige & Lined UI) */}
            <motion.div
              className="absolute w-[420px] h-[260px] rounded-2xl shadow-xl z-10 flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: '#fefce8',
                border: '1px solid #dcb58a',
                backgroundImage: `url(${notesBg})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }}
              initial={{ y: 40, opacity: 0, scale: 0.8 }}
              animate={{
                y: isOpen ? -200 : 40,
                opacity: isOpen ? 1 : 0,
                scale: isOpen ? 1 : 0.8,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Dash Icons */}
              <motion.img
                src={dash1}
                alt=""
                className="absolute top-2 left-2 w-16 opacity-80 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 0.8 : 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
              <motion.img
                src={dash3}
                alt=""
                className="absolute bottom-2 right-2 w-16 opacity-80 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 0.8 : 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />

              {/* Text Inside Note */}
              <p
                className="font-sans text-lg text-center leading-relaxed z-20 relative w-full h-full pt-10 px-6"
                style={{
                  fontFamily: 'Georgia, serif',
                  color: '#713f12',
                  textShadow: '0.5px 0.5px #e7d3a1',
                }}
              >
                {quote}
              </p>
            </motion.div>

            {/* Envelope Image */}
            <motion.img
              src={isOpen ? envelopeOpened : envelopeClosed}
              alt="Envelope"
              className="absolute w-96 cursor-pointer z-20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ bottom: '0' }}
            />

            {/* Below Text */}
            <p className="absolute bottom-[-25px] text-pink-700 text-lg font-cute w-full text-center z-30">
              {isOpen
                ? "Here's your note 💌"
                : 'Tap the envelope for your daily note ✨'}
            </p>
          </div>
        </div>

        {/* MOOD ICON (Middle) */}
        <motion.img
          src={isOpen ? happyIcon : painIcon}
          alt={isOpen ? 'Happy icon' : 'Pain icon'}
          className="w-72 h-auto object-contain"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 0.5, type: 'spring' }}
        />

        {/* MOOD TEXT (Right) */}
        <motion.p
          key={isOpen ? 'happy-text' : 'pain-text'}
          className={`text-xl font-cute max-w-xs ${
            isOpen ? 'text-pink-600' : 'text-red-600'
          }`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.5 }}
        >
          {isOpen
            ? 'Yay! I feel so much better now after reading this!'
            : 'Ugh, ahh, these cramps are so painful...'}
        </motion.p>
      </div>
    </div>
  )
}

export default AEnvelope
