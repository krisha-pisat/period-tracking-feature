// src/components/CycleForm.jsx
import { motion, AnimatePresence } from 'framer-motion'
import barIcon from '../assets/bar.png' // progress icon

const phaseData = {
  Menstrual: {
    title: 'Menstrual Phase',
    description: 'Days 1–5. Your body is shedding the uterine lining. Rest and be kind to yourself.',
    gif: 'https://media.giphy.com/media/ej04VS6HAXQ5ZKf8vS/giphy.gif',
    emoji: '🩸'
  },
  Follicular: {
    title: 'Follicular Phase',
    description: 'Days 6–13. Hormones rise, energy lifts, mood improves — a fresh beginning.',
    gif: 'https://media.giphy.com/media/So2OWdIVfmVffhdAU1/giphy.gif',
    emoji: '🌱'
  },
  Ovulation: {
    title: 'Ovulation Phase',
    description: 'Days 14–15. Peak confidence & connection. You might feel magnetic and social.',
    gif: 'https://media.giphy.com/media/alfvPH5Rbb9zrOA37l/giphy.gif',
    emoji: '🌸'
  },
  Luteal: {
    title: 'Luteal Phase',
    description: 'Days 16–28. Progesterone rises — you may want comfort, quiet, grounding energy.',
    gif: 'https://media.giphy.com/media/qzfjRqIBLgGlcQqHj6/giphy.gif',
    emoji: '🍂'
  },
  Loading: {
    title: 'Loading...',
    description: 'Fetching your cycle details...',
    gif: 'https://media.giphy.com/media/fIe1bZUYk65If3UJu9/giphy.gif',
    emoji: '🩷'
  }
}

// 🌈 Gradient background colors for each phase
const phaseGradients = {
  Menstrual: 'bg-gradient-to-br from-rose-200 to-rose-400',
  Follicular: 'bg-gradient-to-br from-teal-200 to-teal-400',
  Ovulation: 'bg-gradient-to-br from-pink-200 to-amber-200',
  Luteal: 'bg-gradient-to-br from-purple-200 to-purple-400',
  Loading: 'bg-white/70'
}

// FIX: Added default prop value to prevent 'Cannot read properties of undefined (reading 'name')'
function PhaseDisplay({ phaseInfo = { name: 'Loading', dayOfPhase: 0, dayOfCycle: 0, cycle_length: 28 } }) {
  const data = phaseData[phaseInfo.name] || phaseData.Loading

  const cycleProgress = (phaseInfo.dayOfCycle / (phaseInfo.cycle_length || 28)) * 100

  return (
    <div className={`p-6 backdrop-blur-md rounded-3xl shadow-xl flex flex-col items-center transition-all duration-500 ${phaseGradients[phaseInfo.name]}`}>
      <AnimatePresence mode="wait">

        <motion.div
          key={phaseInfo.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center w-full"
        >

          <h2 className="text-3xl font-bold text-gray-800 font-cute">
            {data.emoji} {data.title}
          </h2>

          <p className="text-lg text-gray-700 mt-2">
            You are on <span className="font-bold text-pink-600">Day {phaseInfo.dayOfPhase}</span> of this phase.
          </p>

          {/* Progress Bar */}
          <div className="w-full mt-6">
            <p className="text-sm text-gray-700 text-left">
              Cycle Progress: <span className="font-bold">Day {phaseInfo.dayOfCycle} of {phaseInfo.cycle_length}</span>
            </p>

            <div className="relative w-full bg-gray-200 rounded-full h-6 mt-3 shadow-inner overflow-visible">

              <motion.div
                className="absolute top-0 left-0 bg-pink-500 h-6 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${cycleProgress}%` }}
                transition={{ duration: 1.5, ease: [0.6, 0.05, -0.01, 0.9] }}
              />

              <motion.img
                src={barIcon}
                alt="cycle progress indicator"
                className="absolute -top-3 w-10 h-10 z-20 drop-shadow-md select-none"
                initial={{ left: '0%' }}
                animate={{ left: `calc(${cycleProgress}% - 20px)` }}
                transition={{ duration: 1.5, ease: [0.6, 0.05, -0.01, 0.9] }}
              />

            </div>
          </div>

          <img
            src={data.gif}
            alt={data.title}
            className="w-full max-w-xs h-auto rounded-2xl mt-6 shadow-lg"
          />

          <p className="text-md text-gray-800 mt-4 max-w-xs leading-relaxed font-cute">
            {data.description}
          </p>

        </motion.div>

      </AnimatePresence>
    </div>
  )
}

export default PhaseDisplay