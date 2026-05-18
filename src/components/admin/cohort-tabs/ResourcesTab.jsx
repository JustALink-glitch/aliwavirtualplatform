import { useState, useRef, useEffect } from 'react'
import { Search, Upload, MoreHorizontal, Eye, Download, Trash2, X, FileText, Video, Link as LinkIcon } from 'lucide-react'
import { coursesAPI, resourcesAPI } from '../../../services'
import toast from 'react-hot-toast'

const cardColors = [
  'bg-orange-400',
  'bg-blue-500',
  'bg-red-400',
  'bg-teal-500',
  'bg-purple-500',
]

const typeStyles = {
  pdf: { bg: 'bg-red-50 text-red-600 border border-red-100', icon: FileText },
  video: { bg: 'bg-purple-50 text-purple-600 border border-purple-100', icon: Video },
  link: { bg: 'bg-blue-50 text-blue-600 border border-blue-100', icon: LinkIcon },
}

function UploadModal({ courses, selectedCourseId, onClose, onSuccess }) {
  const [tab, setTab] = useState('link') // default to link for simpler virtual workflows
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [courseId, setCourseId] = useState(selectedCourseId || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !url || !courseId) {
      return toast.error('Please fill in all required fields')
    }
    try {
      setSubmitting(true)
      const res = await resourcesAPI.create({
        course_id: courseId,
        name,
        type: tab,
        url,
        size: tab === 'link' ? '--' : '5 MB'
      })
      if (res.success || res.resource) {
        toast.success('Resource added successfully!')
        if (onSuccess) onSuccess()
        onClose()
      } else {
        toast.error(res.message || 'Failed to upload resource')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-[Manrope]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-800">Add Resource</p>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {['link', 'pdf', 'video'].map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all capitalize ${
                tab === t ? 'bg-white text-[#2563EB] shadow-sm' : 'text-gray-500'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">RESOURCE NAME *</label>
          <input required placeholder="e.g. Week 1 Lecture Slides" value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-bold text-gray-700" />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">URL *</label>
          <input required placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] font-semibold text-gray-700" />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">COURSE *</label>
          <select required value={courseId} onChange={e => setCourseId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] text-gray-600 font-semibold">
            <option value="">Select course...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg py-2.5 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex-1 bg-[#2563EB] text-white text-xs font-bold rounded-lg py-2.5 hover:bg-blue-700 transition-colors">
            {submitting ? 'Adding...' : 'Add Resource'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ActionMenu({ onClose, onDelete }) {
  const ref = useRef()
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40 font-[Manrope]" onClick={e => e.stopPropagation()}>
      <button onClick={onDelete} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 text-left">
        <Trash2 size={13} /> Delete Resource
      </button>
    </div>
  )
}

export default function ResourcesTab({ cohortId }) {
  const [coursesList, setCoursesList] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [resourcesList, setResourcesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingRes, setLoadingRes] = useState(false)

  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const [showUpload, setShowUpload] = useState(false)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await coursesAPI.list({ cohort_id: cohortId })
      if (res.success) {
        setCoursesList(res.courses || [])
        if (res.courses && res.courses.length > 0) {
          setSelectedCourse(res.courses[0])
        }
      }
    } catch (err) {
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cohortId) fetchCourses()
  }, [cohortId])

  const fetchResources = async () => {
    if (!selectedCourse) return
    try {
      setLoadingRes(true)
      const res = await resourcesAPI.list({ courseId: selectedCourse.id })
      if (res.success || res.resources) {
        setResourcesList(res.resources || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRes(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [selectedCourse])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return
    try {
      const res = await resourcesAPI.remove(id)
      if (res.success) {
        toast.success('Resource deleted successfully!')
        fetchResources()
      } else {
        toast.error(res.message || 'Failed to delete resource')
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred')
    }
  }

  const filtered = resourcesList.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 font-[Manrope]">
      {/* Left — Course list */}
      <div className="w-48 flex-shrink-0 space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Courses</p>
        {coursesList.length === 0 ? (
          <p className="text-xs text-gray-400 font-semibold px-2">No courses linked yet</p>
        ) : (
          coursesList.map((course, idx) => (
            <button key={course.id} onClick={() => setSelectedCourse(course)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                selectedCourse?.id === course.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
              }`}>
              <div className={`w-6 h-6 rounded-md ${cardColors[idx % cardColors.length]} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                {course.name[0]}
              </div>
              <p className={`text-xs font-bold truncate ${selectedCourse?.id === course.id ? 'text-[#2563EB]' : 'text-gray-700'}`}>
                {course.name}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Right — Resources */}
      <div className="flex-1 min-w-0 bg-white">
        {selectedCourse ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-800">{selectedCourse.name}</h3>
                <p className="text-xs text-gray-400">{filtered.length} resources uploaded</p>
              </div>
              <button onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-xs font-bold hover:bg-blue-700 transition-colors">
                <Upload size={13} /> Add Resource
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <Search size={13} className="text-gray-400 flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="flex-1 text-xs bg-transparent outline-none text-gray-600 placeholder-gray-400 font-semibold" />
            </div>

            {/* Table */}
            {loadingRes ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2563EB]"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                <p className="text-xs text-gray-400 font-semibold">No resources added to this course yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Resource', 'Type', 'Size', 'Uploader', 'Action'].map(h => (
                        <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {filtered.map((r) => {
                      const lowerType = (r.type || 'link').toLowerCase()
                      const style = typeStyles[lowerType] || typeStyles.link
                      const TypeIcon = style.icon
                      const uploaderName = r.uploader ? `${r.uploader.first_name || ''} ${r.uploader.last_name || ''}`.trim() : 'System Admin'
                      return (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                                <TypeIcon size={13} />
                              </div>
                              <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-800 hover:text-[#2563EB] hover:underline">
                                {r.name}
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${style.bg}`}>{lowerType}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 font-semibold">{r.size || '--'}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 font-bold">{uploaderName}</td>
                          <td className="px-4 py-3 relative">
                            <button onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)}
                              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
                              <MoreHorizontal size={15} />
                            </button>
                            {openMenu === r.id && (
                              <ActionMenu
                                onClose={() => setOpenMenu(null)}
                                onDelete={() => handleDelete(r.id)}
                              />
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
            <p className="text-xs text-gray-400 font-bold">Please select a course on the left to see study resources</p>
          </div>
        )}
      </div>

      {showUpload && (
        <UploadModal
          courses={coursesList}
          selectedCourseId={selectedCourse?.id}
          onClose={() => setShowUpload(false)}
          onSuccess={fetchResources}
        />
      )}
    </div>
  )
}