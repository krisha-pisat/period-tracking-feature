// src/components/Dashboard.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'
import { motion } from 'framer-motion'
import { addDays, differenceInDays, parseISO, startOfDay, isToday } from 'date-fns'
import CycleCalendar from './CycleCalendar.jsx'
import PhaseDisplay from './PhaseDisplay.jsx'
import AEnvelope from './AEnvelope.jsx'
import ChatButton from './ChatButton.jsx'
import dashboardBg from '../assets/dashboard-bg.png'

import dash2 from '../assets/dash2.png'
import dash4 from '../assets/dash4.png'
import arrowDownIcon from '../assets/arrow-down.png' // Import the arrow image

// --- Phase Logic (unchanged) ---
function getPhaseInfo(selectedDate, latestCycle) {
  if (!latestCycle) {
    return { name: 'Loading', dayOfPhase: 0, dayOfCycle: 0, cycle_length: 28 }
  }

  const { start_date, cycle_length, period_length } = latestCycle
  const parsedStartDate = startOfDay(parseISO(start_date))
  const selectedDay = startOfDay(selectedDate)

  const cycleLen = cycle_length || 28
  const periodLen = period_length || 5

  let daysDifference = differenceInDays(selectedDay, parsedStartDate)
  const cycleDayIndex = (daysDifference % cycleLen + cycleLen) % cycleLen
  const dayOfCycle = cycleDayIndex + 1

  // Menstrual Phase: Day 1 to periodLen
  if (dayOfCycle <= periodLen) {
    return { name: 'Menstrual', dayOfPhase: dayOfCycle, dayOfCycle, cycle_length }
  }

  // Follicular Phase: Day (periodLen + 1) to Day 13
  const follicularEndDay = 13
  if (dayOfCycle <= follicularEndDay) {
    return { name: 'Follicular', dayOfPhase: dayOfCycle - periodLen, dayOfCycle, cycle_length }
  }

  // Ovulation Phase: Day 14–15
  const ovulationEndDay = 15
  if (dayOfCycle <= ovulationEndDay) {
    return { name: 'Ovulation', dayOfPhase: dayOfCycle - follicularEndDay, dayOfCycle, cycle_length }
  }

  // Luteal Phase: Day 16 to cycle end
  return { name: 'Luteal', dayOfPhase: dayOfCycle - ovulationEndDay, dayOfCycle, cycle_length }
}

// --- Helper: Calculate next cycle start date (for display/calendar) (unchanged) ---
const calculateNextPeriodStart = (latestCycle, referenceDate) => {
  if (!latestCycle) return referenceDate

  const { start_date, cycle_length } = latestCycle
  const cycleLen = cycle_length || 28
  let lastStart = startOfDay(parseISO(start_date))

  const daysDifference = differenceInDays(startOfDay(referenceDate), lastStart)
  const cyclesToJump = Math.ceil(daysDifference / cycleLen)
  let nextStart = addDays(lastStart, cyclesToJump * cycleLen)

  while (nextStart <= startOfDay(referenceDate)) {
    nextStart = addDays(nextStart, cycleLen)
  }

  return nextStart
}
// --- END Helper ---

function Dashboard() {
  const [latestCycle, setLatestCycle] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestCycle = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && data?.length > 0) {
        const latestCycleData = data[0]
        setLatestCycle(latestCycleData)
        setSelectedDate(new Date())
      } else {
        setSelectedDate(new Date())
      }
      setLoading(false)
    }
    fetchLatestCycle()
  }, [])

  const phaseInfo = getPhaseInfo(selectedDate, latestCycle)

  // --- Date Display Format (DD/MM/YYYY) ---
  let nextPeriodDateDisplay = 'Calculating...'
  if (latestCycle) {
    const nextPeriodDate = calculateNextPeriodStart(latestCycle, new Date())
    const day = String(nextPeriodDate.getDate()).padStart(2, '0')
    const month = String(nextPeriodDate.getMonth() + 1).padStart(2, '0')
    const year = nextPeriodDate.getFullYear()
    nextPeriodDateDisplay = `${day}/${month}/${year}`
  }

  const calendarInitialDate =
    isToday(selectedDate) || loading ? new Date() : startOfDay(selectedDate)

  return (
    <div
      className="flex flex-col items-center min-h-screen bg-cover bg-center p-8 gap-8 relative overflow-hidden"
      style={{ backgroundImage: `url(${dashboardBg})` }}
    >
      {/* 🌸 Title With Cute Decorations */}
      <div className="flex items-center justify-center gap-4 mb-8 mt-6">
        <motion.img
          src={dash2}
          alt="flower-left"
          className="w-20 h-20 object-contain opacity-90"
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />

        <h1 className="text-5xl font-bold text-white text-center drop-shadow-lg font-cute">
          Track Your Cycle
        </h1>

        <motion.img
          src={dash4}
          alt="flower-right"
          className="w-20 h-20 object-contain opacity-90"
          animate={{ rotate: [6, -6, 6] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
      </div>

      {/* 📅 Calendar + Phase Information */}
      <div className="flex flex-col md:flex-row justify-center items-start gap-8 w-full max-w-6xl">
        {/* Left Side: Calendar Card (Now includes the arrow) */}
        <div className="w-full md:w-1/2 flex flex-col items-center"> {/* Changed to flex-col to stack calendar and arrow */}
          <div className="w-full max-w-xl bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-xl">
            <h2 className="text-3xl font-bold text-center text-pink-700 mb-4">Your Cycle</h2>

            <CycleCalendar
              latestCycle={latestCycle}
              selectedDate={calendarInitialDate}
              onDateChange={setSelectedDate}
              getPhaseInfo={getPhaseInfo}
            />

            <div className="mt-6 text-center">
              <h3 className="text-xl font-bold text-gray-800">Next Predicted Period</h3>
              <p className="text-2xl text-pink-600 mt-2">
                {loading ? 'Loading...' : nextPeriodDateDisplay}
              </p>
            </div>
          </div>

          {/* --- NEW POSITION FOR ARROW: Directly under the calendar card --- */}
          <motion.div
            className="flex flex-col items-center mt-6 mb-0" // Adjusted margins for tighter placement
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.img
              src={arrowDownIcon}
              alt="Scroll down indicator"
              className="w-10 h-10 object-contain" // Slightly smaller arrow
              // Animated bounce
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }}
            />
            <p className="text-md font-cute text-gray-700 mt-1">
              Scroll below to see a cofy note ✨
            </p>
          </motion.div>
          {/* --- END NEW POSITION --- */}

        </div>

        {/* Right Side: Phase Info Card */}
        <div className="w-full md:w-1/2 flex flex-col items-center gap-8">
          <div className="w-full max-w-md">
            <PhaseDisplay phaseInfo={phaseInfo} />
          </div>
        </div>
      </div>

      {/* 💌 Cute Envelope Section (Adjusted margin from mt-10 to mt-4) */}
      <div className="mt-4"> 
        <AEnvelope phaseInfo={phaseInfo} />
      </div>

      {/* 💬 Floating Chatbot Button */}
      <ChatButton phaseInfo={phaseInfo} />
    </div>
  )
}

export default Dashboard