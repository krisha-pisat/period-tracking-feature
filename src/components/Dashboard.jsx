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
import arrowDown from '../assets/arrow-down.png'

// --- PHASE LOGIC ---
function getPhaseInfo(selectedDate, latestCycle) {
  if (!latestCycle)
    return { name: 'Loading', dayOfPhase: 0, dayOfCycle: 0, cycle_length: 28 }

  const { start_date, cycle_length, period_length } = latestCycle
  const parsedStartDate = startOfDay(parseISO(start_date))
  const selectedDay = startOfDay(selectedDate)
  const cycleLen = cycle_length || 28
  const periodLen = period_length || 5

  const daysDifference = differenceInDays(selectedDay, parsedStartDate)
  const cycleDayIndex = (daysDifference % cycleLen + cycleLen) % cycleLen
  const dayOfCycle = cycleDayIndex + 1

  if (dayOfCycle <= periodLen)
    return { name: 'Menstrual', dayOfPhase: dayOfCycle, dayOfCycle, cycle_length }
  if (dayOfCycle <= 13)
    return { name: 'Follicular', dayOfPhase: dayOfCycle - periodLen, dayOfCycle, cycle_length }
  if (dayOfCycle <= 15)
    return { name: 'Ovulation', dayOfPhase: dayOfCycle - 13, dayOfCycle, cycle_length }
  return { name: 'Luteal', dayOfPhase: dayOfCycle - 15, dayOfCycle, cycle_length }
}

// --- NEXT PERIOD CALCULATION ---
const calculateNextPeriodStart = (latestCycle) => {
  if (!latestCycle) return null
  const { start_date, cycle_length } = latestCycle
  const parsedStart = startOfDay(parseISO(start_date))
  return addDays(parsedStart, cycle_length || 28)
}

function Dashboard() {
  const [latestCycle, setLatestCycle] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  // ✅ FIX: calendar focuses on next predicted period month
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

        // 🩷 Focus the calendar on predicted next period
        const nextPredicted = calculateNextPeriodStart(latestCycleData)
        setSelectedDate(nextPredicted)
      } else {
        setSelectedDate(new Date())
      }

      setLoading(false)
    }
    fetchLatestCycle()
  }, [])

  const phaseInfo = getPhaseInfo(selectedDate, latestCycle)
  const nextDate = latestCycle ? calculateNextPeriodStart(latestCycle) : null
  const nextPeriodDateDisplay = nextDate
    ? `${String(nextDate.getDate()).padStart(2, '0')}/${String(
        nextDate.getMonth() + 1
      ).padStart(2, '0')}/${nextDate.getFullYear()}`
    : 'Calculating...'

  return (
    <div
      className="flex flex-col items-center min-h-screen bg-cover bg-center p-8 gap-8 relative overflow-hidden"
      style={{ backgroundImage: `url(${dashboardBg})` }}
    >
      {/* 🌸 Title */}
      <div className="flex items-center justify-center gap-4 mb-8 mt-6">
        <motion.img
          src={dash2}
          alt="left"
          className="w-20 h-20 opacity-90"
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
        />
        <h1 className="text-5xl font-bold text-white text-center drop-shadow-lg font-cute">
          Track Your Cycle
        </h1>
        <motion.img
          src={dash4}
          alt="right"
          className="w-20 h-20 opacity-90"
          animate={{ rotate: [6, -6, 6] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
        />
      </div>

      {/* 📅 Calendar + Phase */}
      <div className="flex flex-col md:flex-row justify-center items-start gap-8 w-full max-w-6xl">
        {/* Left: Calendar */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="w-full max-w-xl bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-xl">
            <h2 className="text-3xl font-bold text-center text-pink-700 mb-4">Your Cycle</h2>

            <CycleCalendar
              latestCycle={latestCycle}
              selectedDate={selectedDate}
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

          {/* ⬇️ Arrow + Text directly below calendar */}
          <div className="flex flex-col items-center justify-center mt-4">
            <p className="text-pink-600 font-cute text-lg mb-2">
              Scroll below for your comfort note 💌
            </p>
            <motion.img
              src={arrowDown}
              alt="Scroll arrow"
              className="w-10 h-10 opacity-90"
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>

        {/* Right: Phase Display */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full max-w-md">
            <PhaseDisplay phaseInfo={phaseInfo} />
          </div>
        </div>
      </div>

      {/* 💌 Envelope Section (nudged upward) */}
      <div className="mt-4 -mb-4">
        <AEnvelope phaseInfo={phaseInfo} />
      </div>

      {/* 💬 Floating Chatbot */}
      <ChatButton phaseInfo={phaseInfo} />
    </div>
  )
}

export default Dashboard
