import { useState, useEffect } from 'react'
import './App.css'

interface OutageSlot {
  hour: number
  type: 'full' | 'first-half' | 'second-half'
}

interface DaySchedule {
  date: string
  slots: OutageSlot[]
}

interface ScheduleData {
  queue: string
  address: string
  lastUpdate: string
  scrapedAt?: string
  today: DaySchedule
  tomorrow: DaySchedule
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function App() {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSchedule = (isRefresh = false) => {
      if (isRefresh) setRefreshing(true)

      fetch('/schedule.json?t=' + Date.now())
        .then(res => {
          if (!res.ok) throw new Error('Не вдалося завантажити графік')
          return res.json()
        })
        .then((data: ScheduleData | ScheduleData[]) => {
          const schedule = Array.isArray(data) ? data[0] : data
          setSchedule(schedule)
          setLoading(false)
          setRefreshing(false)
          setError(null)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
          setRefreshing(false)
        })
    }

    fetchSchedule(false)
    const interval = setInterval(() => fetchSchedule(true), 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getHourClass = (slots: OutageSlot[], hour: number): string => {
    const slot = slots.find(s => s.hour === hour)
    if (!slot) return 'hour-cell power'
    if (slot.type === 'full') return 'hour-cell outage'
    if (slot.type === 'first-half') return 'hour-cell outage-first'
    if (slot.type === 'second-half') return 'hour-cell outage-second'
    return 'hour-cell power'
  }

  if (loading) {
    return <div className="container"><p>Завантаження...</p></div>
  }

  if (error || !schedule) {
    return <div className="container"><p className="error">{error || 'Помилка'}</p></div>
  }

  return (
    <div className="container">
      <h1>Графік відключень DTEK</h1>

      <div className="address">
        <span className="group-badge">Черга {schedule.queue}</span>
        {refreshing && <span className="refreshing"> (оновлення...)</span>}
      </div>

      <div className="schedule-table">
        <div className="day-section">
          <div className="day-label">Сьогодні ({schedule.today.date})</div>
          <div className="hours-grid">
            {HOURS.map(h => (
              <div
                key={h}
                className={getHourClass(schedule.today.slots, h)}
              >
                <span className="hour-label">{h}:00–{h + 1}:00</span>
              </div>
            ))}
          </div>
        </div>

        <div className="day-section">
          <div className="day-label">Завтра ({schedule.tomorrow.date})</div>
          <div className="hours-grid">
            {HOURS.map(h => (
              <div
                key={h}
                className={getHourClass(schedule.tomorrow.slots, h)}
              >
                <span className="hour-label">{h}:00–{h + 1}:00</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color power"></div>
          <span>Світло є</span>
        </div>
        <div className="legend-item">
          <div className="legend-color outage"></div>
          <span>Світла немає</span>
        </div>
        <div className="legend-item">
          <div className="legend-color outage-half"></div>
          <span>Частково (30 хв)</span>
        </div>
      </div>

      <p className="info actual">
        <small>DTEK: {schedule.lastUpdate}</small>
        {schedule.scrapedAt && <><br /><small>Скрейпер: {schedule.scrapedAt}</small></>}
      </p>
    </div>
  )
}

export default App
