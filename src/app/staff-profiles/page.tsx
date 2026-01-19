'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Staff {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  skills: string | null
  bio: string | null
  role: {
    roleName: string
  }
}

export default function StaffProfilesPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStaff()
  }, [])

  async function fetchStaff() {
    try {
      const res = await fetch('/api/staff')
      const data = await res.json()
      // Only set data if it's an array (API might return error object)
      if (Array.isArray(data)) {
        setStaff(data)
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  function parseSkills(skillsJson: string | null): string[] {
    if (!skillsJson) return []
    try {
      return JSON.parse(skillsJson)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading staff profiles...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Staff Profiles</h1>
      </div>

      {staff.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No staff profiles available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => {
            const skills = parseSkills(member.skills)
            return (
              <Link
                key={member.id}
                href={`/staff-profiles/${member.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                    <p className="text-gray-500">{member.title || 'No title'}</p>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{member.bio}</p>
                )}

                {member.email && (
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Email:</span> {member.email}
                  </p>
                )}

                {skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                          +{skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t text-center">
                  <span className="text-blue-600 text-sm font-medium">View Profile →</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
