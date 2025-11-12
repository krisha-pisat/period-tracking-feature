// src/components/ChatButton.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CycleChatbot from './CycleChatbot.jsx'

function ChatButton({ phaseInfo }) {
  const [isOpen, setIsOpen] = useState(false)

  // Use a relevant emoji or image for the button
  const chatIcon = "💬"

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      
      {/* 1. Chatbot Window (Conditionally Rendered) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3 }}
            className="mb-4 shadow-2xl rounded-3xl"
          >
            {/* CycleChatbot content is now inside this animated div */}
            <CycleChatbot phaseInfo={phaseInfo} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Chat Button (The Shaking Icon) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full font-sans text-3xl shadow-xl transition-colors duration-300 flex items-center justify-center 
          ${isOpen ? 'bg-pink-700 text-white' : 'bg-pink-500 text-white hover:bg-pink-600'}`}
        
        // Shaking/Floating animation
        animate={{
          y: [0, -5, 0], // Subtle bounce/shake
          rotate: isOpen ? 0 : [0, 5, -5, 5, -5, 0], // Jiggle when closed
        }}
        transition={{
          y: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
          rotate: { duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 3 } // Jiggle every few seconds
        }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? '✕' : chatIcon}
      </motion.button>
      
    </div>
  )
}

export default ChatButton