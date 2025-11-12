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

// --- Phase Logic (FIXED FOR CORRECT PHASE START DAYS) ---
function getPhaseInfo(selectedDate, latestCycle) {
  if (!latestCycle) {
    return { name: 'Loading', dayOfPhase: 0, dayOfCycle: 0, cycle_length: 28 }
  }

  const { start_date, cycle_length, period_length } = latestCycle
  // Ensure we are comparing day starts for consistency
  const parsedStartDate = startOfDay(parseISO(start_date))
  const selectedDay = startOfDay(selectedDate) 
  
  const cycleLen = cycle_length || 28 // Default to 28
  const periodLen = period_length || 5 // Default to 5

  // 1. Calculate the total number of days difference (can be negative).
  let daysDifference = differenceInDays(selectedDay, parsedStartDate)

  // 2. Normalize daysDifference to the 0-indexed day within the cycle (0 to cycleLen - 1).
  const cycleDayIndex = (daysDifference % cycleLen + cycleLen) % cycleLen;

  // 3. dayOfCycle is 1-indexed (Day 1 to Day cycleLen).
  const dayOfCycle = cycleDayIndex + 1;
  
  // --- Phase Logic based on your inputs ---
  // Menstrual Phase: Day 1 to periodLen
  if (dayOfCycle <= periodLen) {
    return { name: 'Menstrual', dayOfPhase: dayOfCycle, dayOfCycle, cycle_length }
  }
  
  // Follicular Phase: Day (periodLen + 1) to Day 13 (Standard Ovulation Prep)
  // Follicular Phase length is 13 - periodLen days.
  const follicularEndDay = 13;
  if (dayOfCycle <= follicularEndDay) {
    // Day of phase is relative to the phase start (periodLen + 1)
    return { name: 'Follicular', dayOfPhase: dayOfCycle - periodLen, dayOfCycle, cycle_length }
  }
  
  // Ovulation Phase: Day 14 and 15 (2 days long)
  const ovulationEndDay = 15;
  if (dayOfCycle <= ovulationEndDay) {
    return { name: 'Ovulation', dayOfPhase: dayOfCycle - follicularEndDay, dayOfCycle, cycle_length }
  }
  
  // Luteal Phase: Day 16 up to cycleLen
  return { name: 'Luteal', dayOfPhase: dayOfCycle - ovulationEndDay, dayOfCycle, cycle_length }
}
// --- END OF getPhaseInfo FIX ---


// --- Helper function to calculate the next cycle start date (for calendar view) ---
const calculateNextPeriodStart = (latestCycle, referenceDate) => {
    if (!latestCycle) return referenceDate;

    const { start_date, cycle_length } = latestCycle;
    const cycleLen = cycle_length || 28;
    let lastStart = startOfDay(parseISO(start_date));
    
    // Calculate difference in cycles
    const daysDifference = differenceInDays(startOfDay(referenceDate), lastStart);
    // Find the number of cycles to jump to pass the referenceDate
    const cyclesToJump = Math.ceil(daysDifference / cycleLen);
    
    // Calculate the start date of the first cycle that begins AFTER or on the referenceDate
    let nextStart = addDays(lastStart, cyclesToJump * cycleLen);

    // If the next start is too far back (e.g. if referenceDate is exactly start date), fast forward one full cycle
    while (nextStart <= startOfDay(referenceDate)) {
        nextStart = addDays(nextStart, cycleLen);
    }
    
    return nextStart;
}
// --- END OF Helper ---


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
        
        // --- CALENDAR VIEW INITIALIZATION FIX ---
        // Set the calendar's initial view to TODAY's month, or the next period month if it's very close
        const today = new Date();
        // Since the user is asking about today's phase, we should default the calendar view to today
        // But also check if the user had selected a date before navigating away.
        setSelectedDate(today)

      } else {
         setSelectedDate(new Date())
      }
      setLoading(false)
    }
    fetchLatestCycle()
  }, [])

  const phaseInfo = getPhaseInfo(selectedDate, latestCycle)

  // Calculate nextPeriodDate for display purposes (Next Period Start, using today as reference)
  let nextPeriodDateDisplay = 'Calculating...'
  if (latestCycle) {
    nextPeriodDateDisplay = calculateNextPeriodStart(latestCycle, new Date()).toLocaleDateString()
  }

  // Set the initial date for the calendar to either the next period date or today,
  // depending on which is closer (or just today for simplicity when loading)
  const calendarInitialDate = isToday(selectedDate) || loading 
    ? new Date() 
    : startOfDay(selectedDate);


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
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />

        <h1 className="text-5xl font-bold text-white text-center drop-shadow-lg font-cute">
          Track Your Cycle 
        </h1>

        <motion.img
          src={dash4}
          alt="flower-right"
          className="w-20 h-20 object-contain opacity-90" 
          animate={{ rotate: [6, -6, 6] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />

      </div>

      {/* 📅 Calendar + Phase Information */}
      <div className="flex flex-col md:flex-row justify-center items-start gap-8 w-full max-w-6xl">

        {/* Left Side: Calendar Card */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full max-w-xl bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-xl">
            <h2 className="text-3xl font-bold text-center text-pink-700 mb-4">Your Cycle</h2>

            <CycleCalendar
              latestCycle={latestCycle}
              // FIX: Use calendarInitialDate to set the view to today's month (or last selected)
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
        </div>

        {/* Right Side: Phase Info Card */}
        <div className="w-full md:w-1/2 flex flex-col items-center gap-8">
          
          {/* Phase Info Card */}
          <div className="w-full max-w-md">
            <PhaseDisplay phaseInfo={phaseInfo} />
          </div>
        </div>

      </div>

      {/* 💌 Cute Envelope Section */}
      <div className="mt-10">
        <AEnvelope phaseInfo={phaseInfo} />
      </div>
      
      {/* 💬 FLOATING CHATBOT BUTTON */}
      <ChatButton phaseInfo={phaseInfo} />

    </div>
  )
}

export default Dashboard