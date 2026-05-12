import { useState, useRef, useEffect } from 'react'
import { Search, Upload, MoreHorizontal, Eye, Download, Trash2, X, FileText, Video, Link as LinkIcon } from 'lucide-react'

const courses = [
  { id: 1, name: 'Data Analytics', color: 'bg-orange-400' },
  { id: 2, name: 'Project Management', color: 'bg-red-400' },
  { id: 3, name: 'UX Design', color: 'bg-blue-500' },
  { id: 4, name: 'DevOps', color: 'bg-green-500' },
  { id: 5, name: 'Full Stack Dev', color: 'bg-purple-500' },
]

const resources = [
  { id: 'RES-001', name: 'Introduction to Data Analytics', type: 'PDF', size: '2.4 MB', uploadedBy: 'Abdulhameed O.', date: 'Apr 10, 2026', course: 1 },
  { id: 'RES-002', name: 'Week 1 - Lecture Recording', type: 'Video', size: '245 MB', uploadedBy: 'Abdulhameed O.', date: 'Apr 11, 2026', course: 1 },
  { id: 'RES-003', name: 'Python Basics Reference Sheet', type: 'PDF', size: '1.1 MB', uploadedBy: 'Abdulhameed O.', date: 'Apr 12, 2026', course: 1 },
  { id: 'RES-004', name: 'Kaggle Dataset Link', type: 'Link', size: '--', uploadedBy: 'Abdulhameed O.', date: 'Apr 13, 2026', course: 1 },
  { id: 'RES-005', name: 'Week 2 - Lecture Recording', type: 'Video', size: '312 MB', uploadedBy: 'Abdulhameed O.', date: 'Apr 18, 2026', course: 1 },
  { id: 'RES-006', name: 'Assignment 1 Brief', type: 'PDF', size: '0.8 MB', uploadedBy: 'Abdulhameed O.', date: 'Apr 19, 2026', course: 1 },
]

const typeStyles = {
  PDF: { bg: 'bg-red-50 text-red-600', icon: FileText },
  Video: { bg: 'bg-purple-50 text-purple-600', icon: Video },
  Link: { bg: 'bg-blue-50 text-blue-600', icon: LinkIcon },
}

function ActionMenu({ onClose }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40">
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Eye size={13} className="text-gray-400" /> Preview
      </button>
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
        <Download size={13} className="text-blue-400" /> Download
      </button>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50">
        <Trash2 size={13} /> Delete
      </button>
    </div>
  )
}

function UploadModal({ onClose }) {
  const [tab, setTab] = useState('file')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-bold text-gray-800">Upload Resource</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
          {['file', 'link'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all capitalize ${
                tab === t ? 'bg-white text-[#2563EB] shadow-sm' : 'text-gray-500'
              }`}>
              {t === 'file' ? 'Upload File' : 'Add Link'}
            </button>
          ))}
        </div>

        {tab === 'file' ? (
          <>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 mb-4 hover:border-[#2563EB] cursor-pointer transition-colors">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload size={18} className="text-[#2563EB]" />
              </div>
              <p className="text-xs font-semibold text-gray-700">Click to upload file</p>
              <p className="text-[11px] text-gray-400">PDF, MP4, DOCX up to 500MB</p>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">COURSE</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600">
                {courses.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">RESOURCE NAME <span className="text-red-500">*</span></label>
              <input placeholder="e.g. Kaggle Dataset" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">URL <span className="text-red-500">*</span></label>
              <input placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">COURSE</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-gray-600">
                {courses.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50">Cancel</button>
          <button className="flex-1 bg-[#2563EB] text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-blue-700">
            {tab === 'file' ? 'Upload' : 'Add Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ResourcesTab() {
  const [selectedCourse, setSelectedCourse] = useState(courses[0])
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [showUpload, setShowUpload] = useState(false)

  const filtered = resources.filter(r =>
    r.course === selectedCourse.id &&
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex gap-4">

      {/* Left — Course list */}
      <div className="w-48 flex-shrink-0 space-y-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">Courses</p>
        {courses.map(course => (
          <button key={course.id} onClick={() => setSelectedCourse(course)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
              selectedCourse.id === course.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
            }`}>
            <div className={`w-6 h-6 rounded-md ${course.color} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
              {course.name[0]}
            </div>
            <p className={`text-xs font-semibold truncate ${selectedCourse.id === course.id ? 'text-[#2563EB]' : 'text-gray-700'}`}>
              {course.name}
            </p>
          </button>
        ))}
      </div>

      {/* Right — Resources */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800">{selectedCourse.name}</h3>
            <p className="text-xs text-gray-400">{filtered.length} resources uploaded</p>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-blue-700 transition-colors">
            <Upload size={13} /> Upload Resource
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
<table className="w-full min-w-[500px]">
  <thead>
    <tr className="bg-gray-50">
      {['Resource', 'Type', 'Size', 'Date', 'Action'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((r) => {
              const TypeIcon = typeStyles[r.type]?.icon || FileText
              return (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${typeStyles[r.type]?.bg} flex items-center justify-center flex-shrink-0`}>
                        <TypeIcon size={13} />
                      </div>
                      <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyles[r.type]?.bg}`}>{r.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.size}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{r.uploadedBy}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.date}</td>
                  <td className="px-4 py-3 relative">
                    <button onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)}
                      className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal size={15} />
                    </button>
                    {openMenu === r.id && <ActionMenu onClose={() => setOpenMenu(null)} />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">No resources uploaded for this course yet</p>
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}