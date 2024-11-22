'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

interface VanDriverOperator {
  id: string
  Van: { plate_number: string }
}

interface Driver {
  id: string
  firstname: string
  lastname: string
}

interface Schedule {
  id: string
  date: string
  assignments?: any[]
}

export default function Component() {
  const [vanDriverOperators, setVanDriverOperators] = useState<VanDriverOperator[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedVanDriverOperator, setSelectedVanDriverOperator] = useState<{ [key: string]: boolean }>({})
  const [selectedSchedule, setSelectedSchedule] = useState('')
  const [selectedTerminal, setSelectedTerminal] = useState('terminal1')
  const [temporaryDrivers, setTemporaryDrivers] = useState<{ [key: string]: string | null }>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentViewDate, setCurrentViewDate] = useState(new Date())

  useEffect(() => {
    async function fetchData() {
      try {
        const [vanDriverOperatorsRes, driversRes, schedulesRes] = await Promise.all([
          axios.get('/api/vandriveroperators'),
          axios.get('/api/drivers'),
          axios.get('/api/schedule'),
        ])

        const vanDriverOperatorsData = vanDriverOperatorsRes.data
        const driversData = driversRes.data
        const schedulesData = schedulesRes.data

        setVanDriverOperators(vanDriverOperatorsData)
        setDrivers(driversData)
        setSchedules(schedulesData)

        const initialSelectedVanDriverOperator = vanDriverOperatorsData.reduce((acc: { [key: string]: boolean }, vdo: VanDriverOperator) => {
          acc[vdo.id] = false
          return acc
        }, {})
        setSelectedVanDriverOperator(initialSelectedVanDriverOperator)

        if (schedulesData.length > 0) {
          const latestSchedule = schedulesData[schedulesData.length - 1]
          setSelectedSchedule(latestSchedule.id)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [])

  const handleAssignSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      const selectedVdoIds = Object.keys(selectedVanDriverOperator).filter(id => selectedVanDriverOperator[id])
      const selectedScheduleData = schedules.find(schedule => schedule.id === selectedSchedule)
      if (!selectedScheduleData) {
        alert('Selected schedule not found.')
        return
      }

      const existingAssignments = selectedScheduleData.assignments || []
      const duplicateAssignments = selectedVdoIds.filter(vdoId =>
        existingAssignments.some(assignment => assignment.VanDriverOperator.id === vdoId)
      )

      if (duplicateAssignments.length > 0) {
        alert('Some van driver operators are already assigned to this schedule.')
        return
      }

      const duplicateAcrossTerminals = selectedVdoIds.filter(vdoId =>
        schedules.some(schedule =>
          new Date(schedule.date).setHours(0, 0, 0, 0) === new Date(selectedScheduleData.date).setHours(0, 0, 0, 0) &&
          schedule.assignments?.some(assignment => assignment.VanDriverOperator.id === vdoId)
        )
      )

      if (duplicateAcrossTerminals.length > 0) {
        alert('Some van driver operators are already assigned to another terminal on this day.')
        return
      }

      const response = await axios.post('/api/vandriveroperators', {
        vanDriverOperatorIds: selectedVdoIds,
        scheduleId: selectedSchedule,
        terminal: selectedTerminal,
        temporaryDrivers,
      })

      const newAssignments = response.data
      setSchedules(schedules.map(schedule =>
        schedule.id === selectedSchedule ? { ...schedule, assignments: [...(schedule.assignments || []), ...newAssignments] } : schedule
      ))
      setShowAssignModal(false)
      toast.success('Assignment created successfully')
      window.location.reload()
    } catch (error) {
      console.error('Failed to create assignment:', error)
      setErrorMessage('Failed to create assignment')
      toast.error('Failed to create assignment')
    }
  }

  const handleRemoveSchedule = async (id: string) => {
    try {
      await axios.delete(`/api/schedule/${id}`)
      setSchedules(schedules.filter(schedule => schedule.id !== id))
      toast.success('Schedule removed successfully')
      window.location.reload()
    } catch (error) {
      console.error('Failed to remove schedule:', error)
      toast.error('Failed to remove schedule')
    }
  }

  const handleRemoveAssignment = async (assignmentId: string, vanDriverOperatorId: string, scheduleId: string) => {
    try {
      await axios.delete(`/api/vandriveroperators?vanDriverOperatorId=${vanDriverOperatorId}&scheduleId=${scheduleId}`)
      setSchedules(schedules.map(schedule => ({
        ...schedule,
        assignments: schedule.assignments?.filter(assignment => assignment.id !== assignmentId)
      })))
      toast.success('Assignment removed successfully')
    } catch (error) {
      console.error('Failed to remove assignment:', error)
      toast.error('Failed to remove assignment')
    }
  }

  const getCurrentDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const date = formData.get('date') as string
    const startTime = formData.get('startTime') as string
    const endTime = formData.get('endTime') as string

    try {
      const response = await axios.post('/api/schedule', {
        date,
        startTime,
        endTime,
      })

      const newSchedule = response.data
      setSchedules([...schedules, newSchedule])
      setShowCreateModal(false)
      toast.success('Schedule created successfully')
      window.location.reload()
    } catch (error) {
      console.error('Failed to create schedule:', error)
      toast.error('Failed to create schedule')
    }
  }

  const renderAssignments = (assignments: any[]) => {
    return (
      <ul>
        {assignments.map((assignment) => (
          <li key={assignment.id} className="flex justify-between items-center">
            <span>
              {assignment.VanDriverOperator?.Van?.plate_number || 'No Plate Number'}: 
              {assignment.Driver ? `${assignment.Driver.firstname} ${assignment.Driver.lastname} (Temporary)` : `${assignment.VanDriverOperator?.Driver?.firstname} ${assignment.VanDriverOperator?.Driver?.lastname}`}
            </span>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition duration-300 mb-1"
              onClick={() => {
              if (window.confirm('Are you sure you want to remove this assignment?')) {
                handleRemoveAssignment(assignment.id, assignment.van_driver_operator_id, assignment.schedule_id)
              }
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    )
  }

  const currentSchedule = schedules.find(schedule => 
    new Date(schedule.date).toDateString() === currentViewDate.toDateString()
  )

  const terminal1Assignments = currentSchedule?.assignments?.filter(assignment => assignment.terminal === 'terminal1') || []
  const terminal2Assignments = currentSchedule?.assignments?.filter(assignment => assignment.terminal === 'terminal2') || []

  const toggleScheduleView = () => {
    const nextSchedule = schedules.find(schedule => new Date(schedule.date) > currentViewDate)
    if (nextSchedule) {
      setCurrentViewDate(new Date(nextSchedule.date))
    }
  }

  const goToToday = () => {
    setCurrentViewDate(new Date())
  }

  const getAvailableVans = () => {
    const selectedScheduleData = schedules.find(schedule => schedule.id === selectedSchedule)
    if (!selectedScheduleData) return vanDriverOperators

    const assignedVans = selectedScheduleData.assignments?.map(assignment => assignment.VanDriverOperator.id) || []
    return vanDriverOperators.filter(vdo => !assignedVans.includes(vdo.id))
  }

  return (
    <div className="container mx-auto px-4 py-8 ml-52">
      <Toaster position="top-right" />
      <div className="mb-8 mt-[-2rem]">
      <div >
            <button
              className="bg-transparent border border-green-600  text-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition duration-300 mr-2"
              onClick={toggleScheduleView}
              disabled={currentViewDate >= new Date(schedules[schedules.length - 1]?.date)}
            >
              Next Schedule
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
              onClick={goToToday}
            >
              Today's Schedule
            </button>
            </div>
      </div>

      <div className="flex  ml-[60rem] mt-[-5rem] mb-20">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 mr-2"
          onClick={() => setShowCreateModal(true)}
        >
          Create Schedule
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          onClick={() => setShowAssignModal(true)}
        >
          Assign Schedule
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 text-red-500">
          {errorMessage}
        </div>
      )}

      <div className="mb-20 mt-[-5rem]">
      
        <div className="flex  items-center mb-4">
          <p className="text-lg font-semibold text-center ml-[32rem]">

            <span className="text-3xl font-bold text-gray-800">
              {currentViewDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
            <br />
            <span className="text-gray-500">
              {currentViewDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </p> 
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-40">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 ml-[-9rem]">Gensan Terminal</h3>
          {terminal1Assignments.length > 0 ? (
            <div className="mb-6 ">
              <div className="flex items-center mb-2 ml-[-9rem] ">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                <p className="text-gray-600">08:00 AM - 5:00 PM</p>
              </div>
              <div className="bg-white shadow rounded-lg p-3 ml-[-9rem] w-[35rem]">
                <p className="font-semibold mb-2 ">Assignments:</p>
                {renderAssignments(terminal1Assignments)}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No assignments for this terminal on this date.</p>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 ml-[-9rem]">Palimbang Terminal</h3>
          {terminal2Assignments.length > 0 ? (
            <div className="mb-6">
              <div className="flex items-center mb-2 ml-[-9rem]">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <p className="text-gray-600">08:00 AM - 5:00 PM</p>
              </div>
              <div className="bg-white shadow rounded-lg p-3  ml-[-9rem] w-[35rem]">
                <p className="font-semibold mb-2">Assignments:</p>
                {renderAssignments(terminal2Assignments)}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No assignments for this terminal on this date.</p>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-semibold mb-4">Create Schedule</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="mb-4">
                <label htmlFor="date" className="block text-gray-700 font-medium mb-2">Date</label>
                <input type="date" id="date" name="date" className="w-full border rounded-lg p-2" defaultValue={getCurrentDate()} required />
              </div>
              <div className="mb-4">
                <label htmlFor="startTime" className="block text-gray-700 font-medium mb-2">Start Time</label>
                <input type="time" id="startTime" name="startTime" className="w-full border rounded-lg p-2" defaultValue="08:00" required />
              </div>
              <div className="mb-4">
                <label htmlFor="endTime" className="block text-gray-700 font-medium mb-2">End Time</label>
                <input type="time" id="endTime" name="endTime" className="w-full border rounded-lg p-2" defaultValue="17:00" required />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="submit"  className="border-2 px-5 border-transparent text-white bg-blue-500 p-2 rounded-lg flex items-center justify-center hover:bg-transparent hover:border-2 hover:border-blue-600 hover:text-blue-700 transition-colors duration-300">Create</button>
                <button type="button"  className="border-2 border-transparent text-white bg-red-500 p-2 rounded-lg flex items-center justify-center hover:bg-transparent hover:border-2 hover:border-red-600 hover:text-red-700 transition-colors duration-300" onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl max-h-[90vh] w-full overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-4">Assign Schedule</h2>
            <form onSubmit={handleAssignSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="schedule" className="block text-gray-700 font-medium mb-2">Schedule</label>
                  <select
                    id="schedule"
                    value={selectedSchedule}
                    onChange={(e) => setSelectedSchedule(e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  >
                    {schedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {new Date(schedule.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="terminal" className="block text-gray-700 font-medium mb-2">Terminal</label>
                  <select
                    id="terminal"
                    value={selectedTerminal}
                    onChange={(e) => setSelectedTerminal(e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  >
                    <option value="terminal1">Gensan Terminal</option>
                    <option value="terminal2">Palimbang Terminal</option>
                  </select>
                </div>
              </div>

                <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Select Vans</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getAvailableVans()
                  .filter((vdo) => drivers.some((driver) => driver.id === vdo.id))
                  .map((vdo) => (
                    <div key={vdo.id} className="flex flex-col items-start">
                    <div className="flex items-center">
                      <input
                      type="checkbox"
                      id={`vdo-${vdo.id}`}
                      checked={selectedVanDriverOperator[vdo.id] || false}
                      onChange={(e) => setSelectedVanDriverOperator({ ...selectedVanDriverOperator, [vdo.id]: e.target.checked })}
                      className="mr-2"
                      />
                      <label htmlFor={`vdo-${vdo.id}`}>{vdo.Van.plate_number} - {drivers.find(driver => driver.id === vdo.id)?.firstname} {drivers.find(driver => driver.id === vdo.id)?.lastname}</label>
                    </div>
                    {selectedVanDriverOperator[vdo.id] && (
                      <select
                      className="mt-2 border rounded-lg p-2 w-full"
                      value={temporaryDrivers[vdo.id] || ''}
                      onChange={(e) => setTemporaryDrivers({ ...temporaryDrivers, [vdo.id]: e.target.value })}
                      >
                      <option value="">Select a temporary driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                        {driver.firstname} {driver.lastname}
                        </option>
                      ))}
                      </select>
                    )}
                    </div>
                  ))}
                </div>
                </div>

              <div className="flex justify-end space-x-2">
                <button type="submit" className="border-2 px-5 border-transparent text-white bg-blue-500 p-2 rounded-lg flex items-center justify-center hover:bg-transparent hover:border-2 hover:border-blue-600 hover:text-blue-700 transition-colors duration-300">Assign</button>
                <button type="button"  className="border-2 border-transparent text-white bg-red-500 p-2 rounded-lg flex items-center justify-center hover:bg-transparent hover:border-2 hover:border-red-600 hover:text-red-700 transition-colors duration-300" onClick={() => setShowAssignModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}