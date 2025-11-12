import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css' // <-- 1. RE-ADD THE DEFAULT STYLES

// This component shows the calendar
function CycleCalendar({ latestCycle, selectedDate, onDateChange, getPhaseInfo }) {

  // This function adds a class to each day on the calendar for background colors
  const getTileClassName = ({ date, view }) => {
    if (view !== 'month' || !latestCycle) {
      return ''
    }

    const phase = getPhaseInfo(date, latestCycle)
    
    // These classes (e.g., 'menstrual-day') are defined in App.css
    switch (phase.name) {
      case 'Menstrual':
        return 'menstrual-day'
      case 'Follicular':
        return 'follicular-day'
      case 'Ovulation':
        return 'ovulation-day'
      case 'Luteal':
        return 'luteal-day'
      default:
        return ''
    }
  }

  return (
    <Calendar
      onChange={onDateChange}
      value={selectedDate}
      tileClassName={getTileClassName} // <-- This is the only style prop we need
      // All other custom props (className, format, etc.) are removed.
    />
  )
}

export default CycleCalendar