'use client'

import { useEffect, useState } from 'react'

interface Role {
  id: string
  roleName: string
  defaultAllocationPercentage: string
}

interface Assignment {
  id: string
  allocatedHours: string
  loggedHours: string
  project: {
    id: string
    name: string
    status: string
  }
  role: {
    id: string
    roleName: string
  }
}

interface Staff {
  id: string
  name: string
  title: string | null
  hourlyCost: string
  hoursQuota: string
  role: Role
  assignments: Assignment[]
  totalAllocatedHours: number
  totalLoggedHours: number
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    hourlyCost: '',
    hoursQuota: '40',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [staffRes, rolesRes] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/roles'),
      ])
      const staffData = await staffRes.json()
      const rolesData = await rolesRes.json()
      // Only set data if it's an array (API might return error object)
      if (Array.isArray(staffData)) {
        setStaff(staffData)
      }
      if (Array.isArray(rolesData)) {
        setRoles(rolesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff'
      const method = editingStaff ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        closeModal()
        fetchData()
      } else {
        const errorData = await res.json()
        alert(`Failed to save: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving staff:', error)
      alert('Failed to save staff member. Check console for details.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this staff member?')) return
    try {
      await fetch(`/api/staff/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Error deleting staff:', error)
    }
  }

  function openEditModal(member: Staff) {
    setEditingStaff(member)
    setFormData({
      name: member.name,
      title: member.title || '',
      hourlyCost: member.hourlyCost,
      hoursQuota: member.hoursQuota || '40',
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingStaff(null)
    setFormData({ name: '', title: '', hourlyCost: '', hoursQuota: '40' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading staff...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Staff Contribution Dashboard</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Staff Member
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No staff members yet. Add your first team member.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Staff Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => {
            const isOverAllocated = member.totalAllocatedHours > Number(member.hoursQuota || 40)
            const progress =
              member.totalAllocatedHours > 0
                ? (member.totalLoggedHours / member.totalAllocatedHours) * 100
                : 0

            return (
              <div
                key={member.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  isOverAllocated ? 'ring-2 ring-red-300' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                    <p className="text-gray-500">{member.title || 'No title'}</p>
                  </div>
                  {isOverAllocated && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      Over-allocated
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hourly Cost</span>
                    <span className="font-medium text-gray-900">
                      ${Number(member.hourlyCost).toFixed(0)}/hr
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Allocated Hours</span>
                    <span
                      className={`font-medium ${
                        isOverAllocated ? 'text-red-600' : 'text-gray-900'
                      }`}
                    >
                      {member.totalAllocatedHours.toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Logged Hours</span>
                    <span className="font-medium text-gray-900">
                      {member.totalLoggedHours.toFixed(1)} hrs
                    </span>
                  </div>
                </div>

                {member.totalAllocatedHours > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isOverAllocated ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Projects */}
                {member.assignments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Assigned Projects</p>
                    <div className="flex flex-col gap-1">
                      {member.assignments.map((a) => (
                        <div
                          key={a.id}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          <span className="font-medium">{a.project.name}</span>
                          <span className="text-gray-500 ml-1">({a.role.roleName})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(member)}
                    className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Senior Architect, Project Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Cost ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.hourlyCost}
                    onChange={(e) => setFormData({ ...formData, hourlyCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours Quota
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.hoursQuota}
                    onChange={(e) => setFormData({ ...formData, hoursQuota: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="40"
                  />
                  <p className="text-xs text-gray-400 mt-1">Maximum hours before over-allocation warning</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingStaff ? 'Save Changes' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
