'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Education {
  degree: string
  institution: string
  year: string
}

interface Experience {
  company: string
  role: string
  duration: string
  description: string
}

interface Staff {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  skills: string | null
  education: string | null
  experience: string | null
  certifications: string | null
  bio: string | null
  executiveSummary: string | null
  hourlyCost: string
  role: {
    roleName: string
  }
  assignments: {
    id: string
    allocatedHours: string
    loggedHours: string
    project: {
      id: string
      name: string
      status: string
    }
    role: {
      roleName: string
    }
  }[]
}

export default function StaffProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [staff, setStaff] = useState<Staff | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    bio: '',
    executiveSummary: '',
    skills: [] as string[],
    education: [] as Education[],
    experience: [] as Experience[],
    certifications: [] as string[],
  })

  const [newSkill, setNewSkill] = useState('')
  const [newCert, setNewCert] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchStaff(params.id as string)
    }
  }, [params.id])

  async function fetchStaff(id: string) {
    try {
      const res = await fetch(`/api/staff/${id}`)
      if (!res.ok) {
        router.push('/staff-profiles')
        return
      }
      const data = await res.json()
      setStaff(data)
      setFormData({
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        executiveSummary: data.executiveSummary || '',
        skills: parseJson(data.skills) || [],
        education: parseJson(data.education) || [],
        experience: parseJson(data.experience) || [],
        certifications: parseJson(data.certifications) || [],
      })
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  function parseJson<T>(json: string | null): T | null {
    if (!json) return null
    try {
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  async function handleSave() {
    if (!staff) return
    setSaving(true)
    try {
      const res = await fetch(`/api/staff/${staff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email || null,
          phone: formData.phone || null,
          bio: formData.bio || null,
          executiveSummary: formData.executiveSummary || null,
          skills: JSON.stringify(formData.skills),
          education: JSON.stringify(formData.education),
          experience: JSON.stringify(formData.experience),
          certifications: JSON.stringify(formData.certifications),
        }),
      })
      if (res.ok) {
        await fetchStaff(staff.id)
        setEditing(false)
      } else {
        alert('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  function addSkill() {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] })
      setNewSkill('')
    }
  }

  function removeSkill(skill: string) {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) })
  }

  function addCertification() {
    if (newCert.trim() && !formData.certifications.includes(newCert.trim())) {
      setFormData({ ...formData, certifications: [...formData.certifications, newCert.trim()] })
      setNewCert('')
    }
  }

  function removeCertification(cert: string) {
    setFormData({ ...formData, certifications: formData.certifications.filter(c => c !== cert) })
  }

  function addEducation() {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', institution: '', year: '' }],
    })
  }

  function updateEducation(index: number, field: keyof Education, value: string) {
    const updated = [...formData.education]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, education: updated })
  }

  function removeEducation(index: number) {
    setFormData({ ...formData, education: formData.education.filter((_, i) => i !== index) })
  }

  function addExperience() {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: '', role: '', duration: '', description: '' }],
    })
  }

  function updateExperience(index: number, field: keyof Experience, value: string) {
    const updated = [...formData.experience]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, experience: updated })
  }

  function removeExperience(index: number) {
    setFormData({ ...formData, experience: formData.experience.filter((_, i) => i !== index) })
  }

  function generateBioSummary() {
    if (!staff) return

    const title = staff.title || 'Professional'
    const projectCount = staff.assignments.length
    const rolesSet = new Set(staff.assignments.map(a => a.role.roleName))
    const roles = Array.from(rolesSet)
    const skills = formData.skills.slice(0, 5)
    const experience = formData.experience

    let bio = `${staff.name} is an experienced ${title}`

    if (experience.length > 0) {
      const totalYears = experience.reduce((acc, exp) => {
        const match = exp.duration.match(/(\d+)/g)
        return acc + (match ? parseInt(match[0]) || 0 : 0)
      }, 0)
      if (totalYears > 0) {
        bio += ` with ${totalYears}+ years of professional experience`
      }
    }

    if (skills.length > 0) {
      bio += `, specializing in ${skills.slice(0, 3).join(', ')}`
      if (skills.length > 3) bio += ` and more`
    }

    bio += '.'

    if (projectCount > 0) {
      bio += ` Currently contributing to ${projectCount} project${projectCount > 1 ? 's' : ''}`
      if (roles.length > 0) {
        bio += ` as ${roles.join(' and ')}`
      }
      bio += '.'
    }

    if (experience.length > 0) {
      const recentExp = experience[0]
      if (recentExp.company && recentExp.role) {
        bio += ` Previously worked at ${recentExp.company} as ${recentExp.role}.`
      }
    }

    if (formData.certifications.length > 0) {
      bio += ` Holds certifications including ${formData.certifications.slice(0, 2).join(' and ')}.`
    }

    // Trim to approximately 100 words
    const words = bio.split(' ')
    if (words.length > 100) {
      bio = words.slice(0, 100).join(' ') + '...'
    }

    setFormData({ ...formData, bio })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Staff member not found.</p>
        <Link href="/staff-profiles" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Staff Profiles
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/staff-profiles" className="text-blue-600 hover:underline flex items-center">
          ← Back to Staff Profiles
        </Link>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : editing ? 'Save Profile' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
            {staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="ml-6 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{staff.name}</h1>
            <p className="text-gray-500 text-lg">{staff.title || 'No title'}</p>
          </div>
        </div>

        {editing ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <button
                  type="button"
                  onClick={generateBioSummary}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Auto-generate from profile
                </button>
              </div>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief bio... Click 'Auto-generate' to create from your title, skills, and experience."
              />
              <p className="text-xs text-gray-400 mt-1">Approximately 100 words recommended</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {staff.email && (
              <p><span className="text-gray-500">Email:</span> {staff.email}</p>
            )}
            {staff.phone && (
              <p><span className="text-gray-500">Phone:</span> {staff.phone}</p>
            )}
            {staff.bio && (
              <p className="md:col-span-2 text-gray-600">{staff.bio}</p>
            )}
          </div>
        )}
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h2>
        {editing ? (
          <div>
            <textarea
              value={formData.executiveSummary}
              onChange={(e) => setFormData({ ...formData, executiveSummary: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write a comprehensive executive summary highlighting key achievements, expertise areas, leadership experience, and value proposition..."
            />
            <p className="text-xs text-gray-400 mt-1">Approximately 200 words recommended</p>
          </div>
        ) : (
          <div>
            {formData.executiveSummary ? (
              <p className="text-gray-600 whitespace-pre-wrap">{formData.executiveSummary}</p>
            ) : (
              <p className="text-gray-400">No executive summary added</p>
            )}
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
        {editing ? (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a skill..."
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full flex items-center"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-blue-400 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {formData.skills.length > 0 ? (
              formData.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-400">No skills added</p>
            )}
          </div>
        )}
      </div>

      {/* Education */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Education</h2>
          {editing && (
            <button onClick={addEducation} className="text-blue-600 hover:underline text-sm">
              + Add Education
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-4">
            {formData.education.map((edu, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Institution"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Year"
                    />
                    <button
                      onClick={() => removeEducation(idx)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {formData.education.length === 0 && (
              <p className="text-gray-400">No education added</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {formData.education.length > 0 ? (
              formData.education.map((edu, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">{edu.degree}</p>
                    <p className="text-sm text-gray-500">{edu.institution} • {edu.year}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No education added</p>
            )}
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
          {editing && (
            <button onClick={addExperience} className="text-blue-600 hover:underline text-sm">
              + Add Experience
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-4">
            {formData.experience.map((exp, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Role"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Duration (e.g., 2020-2023)"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={exp.description}
                      onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Description"
                    />
                    <button
                      onClick={() => removeExperience(idx)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {formData.experience.length === 0 && (
              <p className="text-gray-400">No experience added</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {formData.experience.length > 0 ? (
              formData.experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-blue-500 pl-4">
                  <p className="font-medium text-gray-900">{exp.role}</p>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="text-xs text-gray-400">{exp.duration}</p>
                  {exp.description && (
                    <p className="text-sm text-gray-500 mt-1">{exp.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No experience added</p>
            )}
          </div>
        )}
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
        {editing ? (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a certification..."
              />
              <button
                onClick={addCertification}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((cert, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-50 text-green-700 rounded-full flex items-center"
                >
                  {cert}
                  <button
                    onClick={() => removeCertification(cert)}
                    className="ml-2 text-green-400 hover:text-green-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {formData.certifications.length > 0 ? (
              formData.certifications.map((cert, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full">
                  {cert}
                </span>
              ))
            ) : (
              <p className="text-gray-400">No certifications added</p>
            )}
          </div>
        )}
      </div>

      {/* Project Experience (from assignments) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Experience</h2>
        {staff.assignments.length > 0 ? (
          <div className="space-y-3">
            {staff.assignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/projects/${assignment.project.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{assignment.project.name}</p>
                    <p className="text-sm text-gray-500">Role: {assignment.role.roleName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {Number(assignment.allocatedHours).toFixed(0)} hrs allocated
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        assignment.project.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {assignment.project.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No project assignments</p>
        )}
      </div>

      {editing && (
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}
    </div>
  )
}
