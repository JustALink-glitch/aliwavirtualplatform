import { useState } from 'react'
import Sidebar from '../../components/common/Sidebar'
import TopBar from '../../components/common/TopBar'
import StatCards from '../../components/admin/StatCards'
import CoursesTable from '../../components/admin/CoursesTable'
import AttendanceTable from '../../components/admin/AttendanceTable'
import RightPanel from '../../components/admin/RightPanel'

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-[Manrope,sans-serif] overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          <div className="flex flex-col xl:flex-row gap-5">

            {/* Main content — full width on mobile */}
            <div className="flex-1 min-w-0 space-y-5">
              <StatCards />
              <CoursesTable />
              <AttendanceTable />
            </div>

            {/* Right panel — full width on mobile, fixed width on xl */}
            <div className="w-full xl:w-[240px] xl:flex-shrink-0">
              <RightPanel />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}