'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Role {
  id: string
  roleName: string
  defaultAllocationPercentage: string
}

interface Staff {
  id: string
  name: string
  title: string | null
  role: Role
  hourlyCost: string
}

interface Assignment {
  id: string
  allocatedHours: string
  loggedHours: string
  staff: Staff
  role: Role
}

interface ProjectDocument {
  name: string
  url: string
  uploadedAt: string
}

interface Project {
  id: string
  name: string
  description: string | null
  status: 'ACTIVE' | 'COMPLETED'
  dealSize: string
  blendedRate: string
  totalHours: string
  startDate: string | null
  endDate: string | null
  periodMonths: number | null
  enduserName: string | null
  partnerName: string | null
  techStack: string | null
  googleDriveUrl: string | null
  documents: string | null
  assignments: Assignment[]
}

function calculateMonthsDiff(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  return Math.max(1, months + 1)
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [allStaff, setAllStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [showRoleAssignModal, setShowRoleAssignModal] = useState(false)
  const [selectedRoleForAssign, setSelectedRoleForAssign] = useState<Role | null>(null)
  const [roleAssignments, setRoleAssignments] = useState<{ staffId: string; hours: string }[]>([])
  const [showEditHoursModal, setShowEditHoursModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [editHoursValue, setEditHoursValue] = useState('')
  const [showDoubleConfirm, setShowDoubleConfirm] = useState(false)
  const [assignForm, setAssignForm] = useState({ staffId: '', roleId: '', allocatedHours: '' })
  const [allocationForm, setAllocationForm] = useState<{ id: string; roleName: string; percentage: number }[]>([])
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'COMPLETED',
    dealSize: '',
    blendedRate: '',
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
    fetchData()
  }, [params.id])

  async function fetchData() {
    try {
      const [projectRes, rolesRes, staffRes] = await Promise.all([
        fetch(`/api/projects/${params.id}`),
        fetch('/api/roles'),
        fetch('/api/staff'),
      ])

      const projectData = await projectRes.json()
      const rolesData = await rolesRes.json()
      const staffData = await staffRes.json()

      setProject(projectData)
      setRoles(rolesData)
      setAllStaff(staffData)

      let techStackArray: string[] = []
      if (projectData.techStack) {
        try {
          techStackArray = JSON.parse(projectData.techStack)
        } catch {
          techStackArray = []
        }
      }

      let documentsArray: ProjectDocument[] = []
      if (projectData.documents) {
        try {
          documentsArray = JSON.parse(projectData.documents)
        } catch {
          documentsArray = []
        }
      }

      setEditForm({
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status,
        dealSize: projectData.dealSize,
        blendedRate: projectData.blendedRate,
        startDate: projectData.startDate ? projectData.startDate.split('T')[0] : '',
        endDate: projectData.endDate ? projectData.endDate.split('T')[0] : '',
        periodMonths: projectData.periodMonths?.toString() || '',
        enduserName: projectData.enduserName || '',
        partnerName: projectData.partnerName || '',
        techStack: techStackArray,
        googleDriveUrl: projectData.googleDriveUrl || '',
        documents: documentsArray,
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getRoleAvailableHours(roleId: string) {
    if (!project) return 0
    const role = roles.find((r) => r.id === roleId)
    if (!role) return 0
    const totalRoleHours = (Number(project.totalHours) * Number(role.defaultAllocationPercentage)) / 100
    const assignedHours = project.assignments
      .filter((a) => a.role.id === roleId)
      .reduce((sum, a) => sum + Number(a.allocatedHours), 0)
    return Math.max(0, totalRoleHours - assignedHours)
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!project) return

    const selectedRole = roles.find((r) => r.id === assignForm.roleId)
    if (!selectedRole) return

    const allocatedHours = Number(assignForm.allocatedHours)
    const availableHours = getRoleAvailableHours(assignForm.roleId)

    if (allocatedHours <= 0) {
      alert('Please enter hours to allocate')
      return
    }

    if (allocatedHours > availableHours) {
      alert(`Cannot exceed available hours (${availableHours.toFixed(1)} hrs)`)
      return
    }

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          staffId: assignForm.staffId,
          roleId: assignForm.roleId,
          allocatedHours,
        }),
      })
      if (res.ok) {
        setShowAssignModal(false)
        setAssignForm({ staffId: '', roleId: '', allocatedHours: '' })
        fetchData()
      }
    } catch (error) {
      console.error('Error creating assignment:', error)
    }
  }

  async function handleUpdateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!project) return

    try {
      const submitData = {
        ...editForm,
        techStack: editForm.techStack.length > 0 ? JSON.stringify(editForm.techStack) : null,
        documents: editForm.documents.length > 0 ? JSON.stringify(editForm.documents) : null,
        googleDriveUrl: editForm.googleDriveUrl || null,
      }
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })
      if (res.ok) {
        setShowEditModal(false)
        fetchData()
      } else {
        const errorData = await res.json()
        alert(`Failed to save: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project. Check console for details.')
    }
  }

  function handleAddTechEdit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tech = techInput.trim()
      if (tech && !editForm.techStack.includes(tech)) {
        setEditForm({ ...editForm, techStack: [...editForm.techStack, tech] })
      }
      setTechInput('')
    }
  }

  function handleRemoveTechEdit(tech: string) {
    setEditForm({ ...editForm, techStack: editForm.techStack.filter(t => t !== tech) })
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !project) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', project.id)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setEditForm({
          ...editForm,
          documents: [...editForm.documents, data.file],
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
    setEditForm({
      ...editForm,
      documents: editForm.documents.filter(d => d.url !== url),
    })
  }

  function handleDateChangeEdit(field: 'startDate' | 'endDate', value: string) {
    const newForm = { ...editForm, [field]: value }
    if (newForm.startDate && newForm.endDate) {
      const months = calculateMonthsDiff(newForm.startDate, newForm.endDate)
      newForm.periodMonths = months.toString()
    }
    setEditForm(newForm)
  }

  async function handleLogHours(assignmentId: string, currentLogged: number) {
    const hours = prompt('Enter hours to log:', '0')
    if (!hours) return

    try {
      await fetch('/api/assignments/log-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, hours: Number(hours) }),
      })
      fetchData()
    } catch (error) {
      console.error('Error logging hours:', error)
    }
  }

  async function handleRemoveAssignment(assignmentId: string) {
    if (!confirm('Remove this assignment?')) return

    try {
      await fetch(`/api/assignments/${assignmentId}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Error removing assignment:', error)
    }
  }

  function openAllocationModal() {
    setAllocationForm(
      roles.map((role) => ({
        id: role.id,
        roleName: role.roleName,
        percentage: Number(role.defaultAllocationPercentage),
      }))
    )
    setShowAllocationModal(true)
  }

  function handleAllocationChange(roleId: string, value: number) {
    setAllocationForm((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, percentage: value } : r))
    )
  }

  function getAllocationTotal() {
    return allocationForm.reduce((sum, r) => sum + r.percentage, 0)
  }

  async function handleSaveAllocations(e: React.FormEvent) {
    e.preventDefault()
    const total = getAllocationTotal()
    if (Math.abs(total - 100) > 0.01) {
      alert('Total allocation must equal 100%')
      return
    }

    try {
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roles: allocationForm.map((r) => ({
            id: r.id,
            defaultAllocationPercentage: r.percentage,
          })),
        }),
      })
      if (res.ok) {
        setShowAllocationModal(false)
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update allocations')
      }
    } catch (error) {
      console.error('Error updating allocations:', error)
    }
  }

  function openRoleAssignModal(role: Role) {
    setSelectedRoleForAssign(role)
    setRoleAssignments([{ staffId: '', hours: '' }])
    setShowRoleAssignModal(true)
  }

  function addRoleAssignmentRow() {
    setRoleAssignments([...roleAssignments, { staffId: '', hours: '' }])
  }

  function removeRoleAssignmentRow(index: number) {
    setRoleAssignments(roleAssignments.filter((_, i) => i !== index))
  }

  function updateRoleAssignment(index: number, field: 'staffId' | 'hours', value: string) {
    const updated = [...roleAssignments]
    updated[index] = { ...updated[index], [field]: value }
    setRoleAssignments(updated)
  }

  function getRoleAssignmentTotal() {
    return roleAssignments.reduce((sum, r) => sum + (Number(r.hours) || 0), 0)
  }

  function getRoleQuota() {
    if (!project || !selectedRoleForAssign) return 0
    const totalRoleHours = (Number(project.totalHours) * Number(selectedRoleForAssign.defaultAllocationPercentage)) / 100
    const alreadyAssigned = project.assignments
      .filter((a) => a.role.id === selectedRoleForAssign.id)
      .reduce((sum, a) => sum + Number(a.allocatedHours), 0)
    return Math.max(0, totalRoleHours - alreadyAssigned)
  }

  async function handleRoleAssignSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!project || !selectedRoleForAssign) return

    const validAssignments = roleAssignments.filter(r => r.staffId && Number(r.hours) > 0)
    if (validAssignments.length === 0) {
      alert('Please add at least one staff assignment')
      return
    }

    const totalHours = validAssignments.reduce((sum, r) => sum + Number(r.hours), 0)
    const quota = getRoleQuota()

    if (totalHours > quota) {
      alert(`Total hours (${totalHours}) exceeds available quota (${quota.toFixed(1)} hrs)`)
      return
    }

    try {
      for (const assignment of validAssignments) {
        await fetch('/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            staffId: assignment.staffId,
            roleId: selectedRoleForAssign.id,
            allocatedHours: Number(assignment.hours),
          }),
        })
      }
      setShowRoleAssignModal(false)
      setSelectedRoleForAssign(null)
      setRoleAssignments([])
      fetchData()
    } catch (error) {
      console.error('Error creating assignments:', error)
    }
  }

  function openEditHoursModal(assignment: Assignment) {
    setEditingAssignment(assignment)
    setEditHoursValue(Number(assignment.allocatedHours).toFixed(0))
    setShowDoubleConfirm(false)
    setShowEditHoursModal(true)
  }

  function getMaxAllowedHours() {
    if (!project || !editingAssignment) return 0
    const roleId = editingAssignment.role.id
    const role = roles.find((r) => r.id === roleId)
    if (!role) return 0
    const totalRoleHours = (Number(project.totalHours) * Number(role.defaultAllocationPercentage)) / 100
    const otherAssignedHours = project.assignments
      .filter((a) => a.role.id === roleId && a.id !== editingAssignment.id)
      .reduce((sum, a) => sum + Number(a.allocatedHours), 0)
    return Math.max(0, totalRoleHours - otherAssignedHours)
  }

  async function handleEditHoursSubmit() {
    if (!editingAssignment) return

    const newHours = Number(editHoursValue)
    const loggedHours = Number(editingAssignment.loggedHours)
    const maxAllowed = getMaxAllowedHours()

    if (newHours <= 0) {
      alert('Hours must be greater than 0')
      return
    }

    if (newHours > maxAllowed) {
      alert(`Cannot exceed available quota (${maxAllowed.toFixed(1)} hrs)`)
      return
    }

    // If reducing below logged hours, require double confirmation
    if (newHours < loggedHours && !showDoubleConfirm) {
      setShowDoubleConfirm(true)
      return
    }

    try {
      const res = await fetch(`/api/assignments/${editingAssignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocatedHours: newHours }),
      })
      if (res.ok) {
        setShowEditHoursModal(false)
        setEditingAssignment(null)
        setShowDoubleConfirm(false)
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update hours')
      }
    } catch (error) {
      console.error('Error updating hours:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading project...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Project not found</p>
        <Link href="/projects" className="text-blue-600 hover:text-blue-800">
          Back to Projects
        </Link>
      </div>
    )
  }

  // Calculate allocation breakdown
  const allocations = roles.map((role) => ({
    ...role,
    hours: (Number(project.totalHours) * Number(role.defaultAllocationPercentage)) / 100,
    assigned: project.assignments.filter((a) => a.role.id === role.id),
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/projects" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            &larr; Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit Project
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Assign Staff
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {project.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-900">{project.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {project.enduserName && (
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">{project.enduserName}</p>
                </div>
              )}
              {project.partnerName && (
                <div>
                  <p className="text-sm text-gray-500">Partner</p>
                  <p className="font-medium text-gray-900">{project.partnerName}</p>
                </div>
              )}
            </div>
          </div>
          <div>
            {(project.startDate || project.endDate || project.periodMonths) && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Project Period</p>
                <div className="flex flex-wrap gap-4">
                  {project.startDate && (
                    <div>
                      <p className="text-xs text-gray-400">Start</p>
                      <p className="font-medium text-gray-900">
                        {new Date(project.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {project.endDate && (
                    <div>
                      <p className="text-xs text-gray-400">End</p>
                      <p className="font-medium text-gray-900">
                        {new Date(project.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {project.periodMonths && (
                    <div>
                      <p className="text-xs text-gray-400">Duration</p>
                      <p className="font-medium text-gray-900">{project.periodMonths} months</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {project.techStack && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Technology Stack</p>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(project.techStack).map((tech: string) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Documents Section */}
        {(project.googleDriveUrl || project.documents) && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500 mb-3">Project Documents</p>
            <div className="space-y-3">
              {project.googleDriveUrl && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a
                    href={project.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Document Folder
                  </a>
                </div>
              )}
              {project.documents && (() => {
                try {
                  const docs = JSON.parse(project.documents) as ProjectDocument[]
                  return docs.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400">Uploaded Documents</p>
                      {docs.map((doc) => (
                        <div key={doc.url} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {doc.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : null
                } catch {
                  return null
                }
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Status</p>
          <span
            className={`inline-block mt-1 px-2 py-1 text-sm font-medium rounded ${
              project.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {project.status}
          </span>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Deal Size</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${Number(project.dealSize).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Blended Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${Number(project.blendedRate)}/hr
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Hours</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {Number(project.totalHours).toFixed(0)} hrs
          </p>
        </div>
      </div>

      {/* Hour Allocation Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Hour Allocation by Role</h2>
          <button
            onClick={openAllocationModal}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit Percentages
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {allocations.map((alloc) => {
            const assignedHours = alloc.assigned.reduce((sum, a) => sum + Number(a.allocatedHours), 0)
            const remainingHours = alloc.hours - assignedHours
            const role = roles.find(r => r.id === alloc.id)
            return (
              <div key={alloc.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{alloc.roleName}</p>
                  <span className="text-sm text-gray-500">{Number(alloc.defaultAllocationPercentage)}%</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{alloc.hours.toFixed(0)} hrs</p>
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Assigned: {assignedHours.toFixed(0)} hrs</span>
                    <span className={remainingHours > 0 ? 'text-orange-600' : 'text-gray-400'}>
                      {remainingHours > 0 ? `Remaining: ${remainingHours.toFixed(0)} hrs` : 'Fully assigned'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min((assignedHours / alloc.hours) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                {alloc.assigned.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {alloc.assigned.map((a) => `${a.staff.name} (${Number(a.allocatedHours).toFixed(0)}h)`).join(', ')}
                  </p>
                )}
                {remainingHours > 0 && role && (
                  <button
                    onClick={() => openRoleAssignModal(role)}
                    className="mt-3 w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Assign Staff
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Staff Assignments</h2>
        {project.assignments.length === 0 ? (
          <p className="text-gray-500">No staff assigned yet. Click "Assign Staff" to add team members.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Staff Member
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Allocated
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Logged
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {project.assignments.map((assignment) => {
                  const allocated = Number(assignment.allocatedHours)
                  const logged = Number(assignment.loggedHours)
                  const progress = allocated > 0 ? (logged / allocated) * 100 : 0

                  return (
                    <tr key={assignment.id}>
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {assignment.staff.name}
                      </td>
                      <td className="px-4 py-4 text-gray-500">{assignment.role.roleName}</td>
                      <td className="px-4 py-4 text-gray-900">{allocated.toFixed(1)} hrs</td>
                      <td className="px-4 py-4 text-gray-900">{logged.toFixed(1)} hrs</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">{progress.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => openEditHoursModal(assignment)}
                          className="text-green-600 hover:text-green-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleLogHours(assignment.id, logged)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Log Hours
                        </button>
                        <button
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Staff Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Assign Staff</h2>
            <form onSubmit={handleAssign}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Member
                  </label>
                  <select
                    required
                    value={assignForm.staffId}
                    onChange={(e) => setAssignForm({ ...assignForm, staffId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select staff member</option>
                    {allStaff.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}{staff.title ? ` (${staff.title})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role for this Project
                  </label>
                  <select
                    required
                    value={assignForm.roleId}
                    onChange={(e) => setAssignForm({ ...assignForm, roleId: e.target.value, allocatedHours: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => {
                      const totalHours = (Number(project.totalHours) * Number(role.defaultAllocationPercentage)) / 100
                      const assignedHours = project.assignments
                        .filter((a) => a.role.id === role.id)
                        .reduce((sum, a) => sum + Number(a.allocatedHours), 0)
                      const availableHours = Math.max(0, totalHours - assignedHours)
                      return (
                        <option key={role.id} value={role.id}>
                          {role.roleName} ({availableHours.toFixed(0)} hrs available of {totalHours.toFixed(0)})
                        </option>
                      )
                    })}
                  </select>
                </div>
                {assignForm.roleId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours to Allocate
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={getRoleAvailableHours(assignForm.roleId)}
                      value={assignForm.allocatedHours}
                      onChange={(e) => setAssignForm({ ...assignForm, allocatedHours: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Max: ${getRoleAvailableHours(assignForm.roleId).toFixed(1)} hrs`}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Available: {getRoleAvailableHours(assignForm.roleId).toFixed(1)} hrs
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Project</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                    <span className="text-gray-400 font-normal ml-2">(max 150 words)</span>
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => {
                      const words = e.target.value.trim().split(/\s+/).filter(w => w.length > 0)
                      if (words.length <= 150 || e.target.value.length < editForm.description.length) {
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    placeholder="Enter project description"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {editForm.description.trim().split(/\s+/).filter(w => w.length > 0).length}/150 words
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={editForm.enduserName}
                      onChange={(e) => setEditForm({ ...editForm, enduserName: e.target.value })}
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
                      value={editForm.partnerName}
                      onChange={(e) => setEditForm({ ...editForm, partnerName: e.target.value })}
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
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value as 'ACTIVE' | 'COMPLETED' })
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
                    {editForm.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTechEdit(tech)}
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
                    onKeyDown={handleAddTechEdit}
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
                        value={editForm.googleDriveUrl}
                        onChange={(e) => setEditForm({ ...editForm, googleDriveUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://drive.google.com/... or \\server\share\..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Upload Documents
                      </label>
                      {editForm.documents.length > 0 && (
                        <div className="mb-2 space-y-2">
                          {editForm.documents.map((doc) => (
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
                        value={editForm.startDate}
                        onChange={(e) => handleDateChangeEdit('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) => handleDateChangeEdit('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Duration (months)</label>
                      <input
                        type="number"
                        min="1"
                        value={editForm.periodMonths}
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
                        value={editForm.dealSize}
                        onChange={(e) => setEditForm({ ...editForm, dealSize: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Blended Rate ($/hr)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={editForm.blendedRate}
                        onChange={(e) => setEditForm({ ...editForm, blendedRate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                {editForm.dealSize && editForm.blendedRate && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>New Total Hours:</strong>{' '}
                      {(Number(editForm.dealSize) / Number(editForm.blendedRate)).toFixed(1)} hrs
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Note: Updating deal size will recalculate all assignments
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Allocation Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Role Allocations</h2>
            <p className="text-sm text-gray-500 mb-4">
              Adjust the percentage for each role. Total must equal 100%.
            </p>
            <form onSubmit={handleSaveAllocations}>
              <div className="space-y-4">
                {allocationForm.map((role) => (
                  <div key={role.id} className="flex items-center justify-between">
                    <label className="font-medium text-gray-700">{role.roleName}</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={role.percentage}
                        onChange={(e) =>
                          handleAllocationChange(role.id, Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                      <span className="ml-2 text-gray-500">%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className={`mt-4 p-3 rounded-lg ${
                  Math.abs(getAllocationTotal() - 100) < 0.01
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>Total:</span>
                  <span>{getAllocationTotal()}%</span>
                </div>
                {Math.abs(getAllocationTotal() - 100) >= 0.01 && (
                  <p className="text-sm mt-1">
                    {getAllocationTotal() < 100
                      ? `Add ${(100 - getAllocationTotal()).toFixed(0)}% more`
                      : `Remove ${(getAllocationTotal() - 100).toFixed(0)}%`}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAllocationModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Math.abs(getAllocationTotal() - 100) >= 0.01}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Save Allocations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleAssignModal && selectedRoleForAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-2">
              Assign Staff to {selectedRoleForAssign.roleName}
            </h2>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-blue-800">Available Quota:</span>
                <span className="font-semibold text-blue-800">{getRoleQuota().toFixed(0)} hrs</span>
              </div>
            </div>
            <form onSubmit={handleRoleAssignSubmit}>
              <div className="space-y-3">
                {roleAssignments.map((assignment, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <select
                      value={assignment.staffId}
                      onChange={(e) => updateRoleAssignment(index, 'staffId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select staff member</option>
                      {allStaff
                        .filter(s => !roleAssignments.some((r, i) => i !== index && r.staffId === s.id))
                        .map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name}{staff.title ? ` (${staff.title})` : ''}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Hours"
                      value={assignment.hours}
                      onChange={(e) => updateRoleAssignment(index, 'hours', e.target.value)}
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">hrs</span>
                    {roleAssignments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoleAssignmentRow(index)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addRoleAssignmentRow}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add another staff member
              </button>
              <div
                className={`mt-4 p-3 rounded-lg ${
                  getRoleAssignmentTotal() <= getRoleQuota()
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>Total to assign:</span>
                  <span>{getRoleAssignmentTotal()} hrs</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span>Remaining after assignment:</span>
                  <span>{(getRoleQuota() - getRoleAssignmentTotal()).toFixed(0)} hrs</span>
                </div>
                {getRoleAssignmentTotal() > getRoleQuota() && (
                  <p className="text-sm mt-2 text-red-600">
                    Exceeds quota by {(getRoleAssignmentTotal() - getRoleQuota()).toFixed(0)} hrs
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleAssignModal(false)
                    setSelectedRoleForAssign(null)
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={getRoleAssignmentTotal() > getRoleQuota() || getRoleAssignmentTotal() === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Assign Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Hours Modal */}
      {showEditHoursModal && editingAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">Edit Allocated Hours</h2>
            <p className="text-sm text-gray-500 mb-4">
              Editing hours for <strong>{editingAssignment.staff.name}</strong> ({editingAssignment.role.roleName})
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Allocated:</span>
                  <span className="font-medium">{Number(editingAssignment.allocatedHours).toFixed(0)} hrs</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Logged Hours:</span>
                  <span className="font-medium">{Number(editingAssignment.loggedHours).toFixed(0)} hrs</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Max Available:</span>
                  <span className="font-medium">{getMaxAllowedHours().toFixed(0)} hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Allocated Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max={getMaxAllowedHours()}
                  value={editHoursValue}
                  onChange={(e) => {
                    setEditHoursValue(e.target.value)
                    setShowDoubleConfirm(false)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {Number(editHoursValue) < Number(editingAssignment.loggedHours) && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> The new allocation ({editHoursValue} hrs) is less than the logged hours ({Number(editingAssignment.loggedHours).toFixed(0)} hrs). This will result in an over-utilization.
                  </p>
                </div>
              )}

              {showDoubleConfirm && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm text-red-800 mb-2">
                    <strong>Are you sure?</strong> You are setting allocated hours below the logged hours. This action cannot be undone automatically.
                  </p>
                  <p className="text-sm text-red-700">
                    Click "Confirm Update" again to proceed.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditHoursModal(false)
                  setEditingAssignment(null)
                  setShowDoubleConfirm(false)
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditHoursSubmit}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showDoubleConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {showDoubleConfirm ? 'Confirm Update' : 'Update Hours'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
