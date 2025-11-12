import { Routes, Route } from 'react-router-dom' // <-- 1. Import
import CycleForm from './components/CycleForm.jsx'
import Dashboard from './components/Dashboard.jsx' // <-- 2. Import new page
import './App.css'

function App() {
  return (
    // 3. Define the routes
    <Routes>
      <Route path="/" element={<CycleForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App