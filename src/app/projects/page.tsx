'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ProjectDocument {
  name: string
  url: string
  uploadedAt: string
}

interface Project {
  id: string
  name: string
  status: 'ACTIVE' | 'COMPLETED'
  dealSize: string
  blendedRate: string
  totalHours: string
  techStack: string | null
  createdAt: string
  assignments: Array<{
    staff: { name: string }
    role: { roleName: string }
  }>
}

function calculateMonthsDiff(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  return Math.max(1, months + 1)
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'COMPLETED',
    dealSize: '',
    blendedRate: '100',
    startDate: '',
    endDate: '',
    periodMonths: '',
    enduserName: '',
    partnerName: '',
    techStack: [] as string[],
    googleDriveUrl: '',
    documents: [] as ProjectDocument[],
  })
  const [techInput, setTechInput] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      // Only set data if it's an array (API might return error object)
      if (Array.isArray(data)) {
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        techStack: formData.techStack.length > 0 ? JSON.stringify(formData.techStack) : null,
        documents: formData.documents.length > 0 ? JSON.stringify(formData.documents) : null,
        googleDriveUrl: formData.googleDriveUrl || null,
      }
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })
      if (res.ok) {
        setShowModal(false)
        setFormData({
          name: '',
          description: '',
          status: 'ACTIVE',
          dealSize: '',
          blendedRate: '100',
          startDate: '',
          endDate: '',
          periodMonths: '',
          enduserName: '',
          partnerName: '',
          techStack: [],
          googleDriveUrl: '',
          documents: [],
        })
        setTechInput('')
        fetchProjects()
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  function handleAddTech(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tech = techInput.trim()
      if (tech && !formData.techStack.includes(tech)) {
        setFormData({ ...formData, techStack: [...formData.techStack, tech] })
      }
      setTechInput('')
    }
  }

  function handleRemoveTech(tech: string) {
    setFormData({ ...formData, techStack: formData.techStack.filter(t => t !== tech) })
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('projectId', 'new')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData({
          ...formData,
          documents: [...formData.documents, data.file],
        })
      } else {
        alert('Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function handleRemoveDocument(url: string) {
    setFormData({
      ...formData,
      documents: formData.documents.filter(d => d.url !== url),
    })
  }

  function handleDateChange(field: 'startDate' | 'endDate', value: string) {
    const newFormData = { ...formData, [field]: value }
    if (newFormData.startDate && newFormData.endDate) {
      const months = calculateMonthsDiff(newFormData.startDate, newFormData.endDate)
      newFormData.periodMonths = months.toString()
    }
    setFormData(newFormData)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading projects...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deal Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        project.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    ${Number(project.dealSize).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    ${Number(project.blendedRate)}/hr
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {Number(project.totalHours).toFixed(0)} hrs
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {project.assignments.length === 0
                      ? 'No assignments'
                      : `${project.assignments.length} assigned`}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">New Project</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                    <span className="text-gray-400 font-normal ml-2">(max 150 words)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      const words = e.target.value.trim().split(/\s+/).filter(w => w.length > 0)
                      if (words.length <= 150 || e.target.value.length < formData.description.length) {
                        setFormData({ ...formData, description: e.target.value })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    placeholder="Enter project description"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.description.trim().split(/\s+/).filter(w => w.length > 0).length}/150 words
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.enduserName}
                      onChange={(e) => setFormData({ ...formData, enduserName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Partner Name
                    </label>
                    <input
                      type="text"
                      value={formData.partnerName}
                      onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter partner name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'COMPLETED' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Technology Stack
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="ml-2 text-blue-600 hover:text-blue-900"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleAddTech}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type and press Enter to add (e.g. React, Node.js, PostgreSQL)"
                  />
                  <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add a tag</p>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Project Documents
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Document Folder URL (Google Drive / Network Path)
                      </label>
                      <input
                        type="url"
                        value={formData.googleDriveUrl}
                        onChange={(e) => setFormData({ ...formData, googleDriveUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://drive.google.com/... or \\server\share\..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Upload Documents
                      </label>
                      {formData.documents.length > 0 && (
                        <div className="mb-2 space-y-2">
                          {formData.documents.map((doc) => (
                            <div
                              key={doc.url}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 truncate flex-1"
                              >
                                {doc.name}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(doc.url)}
                                className="ml-2 text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploading && (
                          <span className="text-sm text-gray-500">Uploading...</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Upload project-related documents (contracts, specs, etc.)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Project Period
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Duration (months)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.periodMonths}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        placeholder="Auto-calculated"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Financials
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Deal Size ($)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.dealSize}
                        onChange={(e) => setFormData({ ...formData, dealSize: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Blended Rate ($/hr)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.blendedRate}
                        onChange={(e) => setFormData({ ...formData, blendedRate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>
                {formData.dealSize && formData.blendedRate && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Calculated Hours:</strong>{' '}
                      {(Number(formData.dealSize) / Number(formData.blendedRate)).toFixed(1)} hrs
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
