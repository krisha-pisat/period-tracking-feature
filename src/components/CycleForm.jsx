import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import { motion } from 'framer-motion'
import formPic from '../assets/form-pic.png'

// --- Import your images ---
import bgForm from '../assets/period-bg-form.png'
import img1 from '../assets/image1.png'
import img2 from '../assets/image2.png'
import img3 from '../assets/image3.png'
import img4 from '../assets/image4.png'

function CycleForm() {
  const navigate = useNavigate()

  const [lastPeriodDate, setLastPeriodDate] = useState('')
  const [cycleLength, setCycleLength] = useState('')
  const [periodLength, setPeriodLength] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = {
      start_date: lastPeriodDate,
      cycle_length: parseInt(cycleLength, 10),
      period_length: parseInt(periodLength, 10),
    }

    const { data, error } = await supabase
      .from('cycles')
      .insert([formData])

    setLoading(false)

    if (error) {
      console.error('Error inserting data:', error)
      setMessage(`Error: ${error.message}`)
    } else {
      console.log('Data inserted:', data)
      setMessage('Success! Your info is saved. 💞')
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    }
  }

  return (
    // --- MAIN PAGE CONTAINER ---
    <div 
      className="relative flex items-center justify-center min-h-screen p-8 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bgForm})` }}
    >
      
      {/* --- RELATIVE WRAPPER FOR FORM + ANIMATIONS --- */}
      <div className="relative w-full max-w-4xl">

        {/* --- UPDATED IMAGES: Added z-20 to bring them in front --- */}
        <motion.img
          src={img1}
          alt="decoration"
          className="hidden md:block absolute -top-16 -left-20 w-52 h-52 object-contain z-20"
          animate={{ translateY: -15 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.img
          src={img2}
          alt="decoration"
          className="hidden md:block absolute -bottom-20 -left-16 w-44 h-44 object-contain z-20"
          animate={{ translateY: -12 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.img
          src={img3}
          alt="decoration"
          className="hidden md:block absolute -top-20 -right-20 w-48 h-48 object-contain z-20"
          animate={{ translateY: -10 }}
          transition={{ duration: 3.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.img
          src={img4}
          alt="decoration"
          className="hidden md:block absolute -bottom-20 -right-20 w-52 h-52 object-contain z-20"
          animate={{ translateY: -18 }}
          transition={{ duration: 2.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />

        {/* --- FORM CARD (now at z-10, so it's behind the images) --- */}
        <div className="relative w-full bg-white rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden z-10">
          
          {/* Column 1: Image (Unchanged) */}
          <div className="bg-pink-100 p-12 flex flex-col items-center justify-center order-2 md:order-1">
            <img
              src={formPic}
              alt="Woman checking a period calendar"
              className="w-full h-auto max-w-sm object-contain"
            />
            <h2 className="text-3xl text-pink-600 mt-6 text-center">Welcome!</h2>
            {/* --- FIX 1: Corrected </D> to </p> --- */}
            <p className="text-pink-500 mt-2 text-center">
              Just a few details to get started.
            </p>
          </div>

          {/* Column 2: The Form (Unchanged) */}
          <div className="p-12 order-1 md:order-2">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <h1 className="text-3xl font-bold text-center text-pink-700">
                Let's get your cycle setup 💗
              </h1>

              <div>
                <label
                  htmlFor="lastPeriodDate"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  First day of your last period 🩸
                </label>
                <input
                  type="date"
                  id="lastPeriodDate"
                  name="lastPeriodDate"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  required
                  className="w-full bubbly-input"
                />
              </div>

              <div>
                <label
                  htmlFor="cycleLength"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Average cycle length (days) 🌙
                </label>
                <input
                  type="number"
                  id="cycleLength"
                  name="cycleLength"
                  min="1"
                  placeholder="e.g., 28"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  required
                  className="w-full bubbly-input"
                />
              </div>

              <div>
                <label
                  htmlFor="periodLength"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Typical period length (days) 🩷
                </label>
                <input
                  type="number"
                  id="periodLength"
                  name="periodLength"
                  min="1"
                  placeholder="e.g., 5"
                  value={periodLength}
                  // --- FIX 2: Corrected e.g.target.value to e.target.value ---
                  onChange={(e) => setPeriodLength(e.target.value)}
                  required
                  className="w-full bubbly-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 text-white font-bold bubbly-button hover:bg-pink-600 focus:ring-pink-300 mt-4 disabled:bg-pink-300"
              >
                {loading ? 'Saving...' : 'Save & Continue 💞'}
              </button>

              {message && (
                <p className="text-center text-pink-600">{message}</p>
              )}
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}

export default CycleForm