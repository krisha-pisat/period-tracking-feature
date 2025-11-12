// src/components/CycleChatbot.jsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const phaseData = {
  Menstrual: {
    title: 'Menstrual Phase',
    description: 'The Menstrual Phase is when bleeding occurs as the uterine lining is shed. This phase typically lasts 3 to 7 days. Your energy may be lower, and you might experience cravings or discomfort. Focus on rest and nourishment.',
    emoji: '🩸'
  },
  Follicular: {
    title: 'Follicular Phase',
    description: 'The Follicular Phase is when the body prepares to release an egg. This is a time of rising estrogen, which often leads to increased energy, focus, and a feeling of renewal. It’s a great time for planning and starting new projects.',
    emoji: '🌱'
  },
  Ovulation: {
    title: 'Ovulation Phase',
    description: 'During the Ovulation Phase, the egg is released, and your estrogen levels peak. This is often described as your "social energy peak." You might feel confident, communicative, and magnetic. It lasts around 2 days.',
    emoji: '🌸'
  },
  Luteal: {
    title: 'Luteal Phase',
    description: 'The Luteal Phase follows ovulation. Progesterone rises, which can lead to PMS symptoms, a desire for comfort, and grounding energy. Focus on winding down, gentle movement, and self-care.',
    emoji: '🍂'
  },
  Loading: {
    title: 'The Cycle Assistant',
    description: "Hello! I'm here to help you understand your cycle. Please ask me about your current phase!",
    emoji: '🩷'
  }
}

function CycleChatbot({ phaseInfo }) {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: phaseData.Loading.description,
    },
  ])
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)

  // Scroll to the bottom of the chat box on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Function to generate the bot's response
  const generateBotResponse = (question, info) => {
    const currentPhase = phaseData[info.name] || phaseData.Loading
    const phaseName = info.name.toLowerCase()

    if (phaseName === 'loading') {
      return "I'm still fetching your latest cycle data from the database. Please wait a moment and try again!"
    }

    const keywords = ['phase', 'am i in', 'what phase', 'period', 'cycle', 'day']

    // Check if the question is cycle-related
    if (keywords.some(k => question.toLowerCase().includes(k))) {
      let response = `You are currently in the **${currentPhase.title}** ${currentPhase.emoji} phase. `
      response += `This is Day **${info.dayOfPhase}** of this phase, and Day **${info.dayOfCycle}** of your predicted **${info.cycle_length || 28}** day cycle. `
      response += `\n\n**About this phase:** ${currentPhase.description}`
      return response
    }

    return "I'm a cycle-tracking assistant. I can only answer questions about your current menstrual cycle phase. Try asking 'What phase am I in?'"
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')

    // 1. Add user message
    setMessages(prev => [...prev, { type: 'user', text: userMessage }])

    // 2. Generate and add bot response after a short delay
    const botResponseText = generateBotResponse(userMessage, phaseInfo)
    
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: botResponseText }])
    }, 800)
  }

  const MessageBubble = ({ type, text }) => {
    const isBot = type === 'bot'
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div 
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-md font-sans text-sm whitespace-pre-wrap
            ${isBot 
              ? 'bg-pink-100 text-pink-800 rounded-bl-none' 
              : 'bg-pink-500 text-white rounded-br-none'
            }`}
          // Use dangerouslySetInnerHTML to parse the bold markdown (**)
          dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }}
        />
      </motion.div>
    )
  }

  return (
    // REMOVED outer styling (w-full max-w-lg bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-6) 
    // to allow parent component (ChatButton) to handle positioning and animation.
    <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4">
      <h2 className="text-2xl font-bold text-center text-pink-700 mb-3">
        Cycle Chat 💬
      </h2>

      {/* Chat Messages */}
      <div className="h-64 overflow-y-auto pr-2 mb-3 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <MessageBubble key={index} type={msg.type} text={msg.text} />
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your phase..."
          className="flex-grow bubbly-input border-pink-300 focus:border-pink-500 text-sm"
        />
        <button
          type="submit"
          className="bubbly-button bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50 text-sm py-2 px-3"
          disabled={!input.trim()}
        >
          Send
        </button>
      </form>
      
      {/* Scrollbar styling for a custom-scrollbar class (recommended to be in App.css if possible) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #fbcfe8; /* pink-200 */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fdf2f8; /* pink-50 */
        }
      `}</style>
    </div>
  )
}

export default CycleChatbot