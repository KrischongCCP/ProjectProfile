'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  status: 'POTENTIAL' | 'ACTIVE'
  dealSize: string
  blendedRate: string
  totalHours: string
  assignments: Array<{
    id: string
    allocatedHours: string
    loggedHours: string
    staff: { name: string }
    role: { roleName: string }
  }>
}

interface Staff {
  id: string
  name: string
  role: { roleName: string }
  totalAllocatedHours: number
  totalLoggedHours: number
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, staffRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/staff'),
        ])
        const projectsData = await projectsRes.json()
        const staffData = await staffRes.json()
        // Only set data if it's an array (API might return error object)
        if (Array.isArray(projectsData)) {
          setProjects(projectsData)
        }
        if (Array.isArray(staffData)) {
          setStaff(staffData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  const activeProjects = projects.filter((p) => p.status === 'ACTIVE')
  const potentialProjects = projects.filter((p) => p.status === 'POTENTIAL')
  const totalDealValue = projects.reduce((sum, p) => sum + Number(p.dealSize), 0)
  const totalHours = projects.reduce((sum, p) => sum + Number(p.totalHours), 0)
  const overAllocatedStaff = staff.filter((s) => s.totalAllocatedHours > 40)

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Projects"
          value={activeProjects.length}
          subtitle={`${potentialProjects.length} potential`}
          color="blue"
        />
        <StatCard
          title="Total Deal Value"
          value={`$${totalDealValue.toLocaleString()}`}
          subtitle="Across all projects"
          color="green"
        />
        <StatCard
          title="Total Hours"
          value={totalHours.toFixed(0)}
          subtitle="Billable hours"
          color="purple"
        />
        <StatCard
          title="Staff Members"
          value={staff.length}
          subtitle={overAllocatedStaff.length > 0 ? `${overAllocatedStaff.length} over-allocated` : 'All balanced'}
          color={overAllocatedStaff.length > 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Over-Allocated Staff Warning */}
      {overAllocatedStaff.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <h3 className="text-red-800 font-semibold mb-2">
            Over-Allocated Staff ({'>'}40 hrs/week)
          </h3>
          <div className="space-y-2">
            {overAllocatedStaff.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-red-700">
                <span>{s.name} ({s.role.roleName})</span>
                <span className="font-medium">{s.totalAllocatedHours.toFixed(1)} hrs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <Link
              href="/projects"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects yet. Create one to get started.</p>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-500">
                        ${Number(project.dealSize).toLocaleString()} · {Number(project.totalHours).toFixed(0)} hrs
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        project.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Staff Workload */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Staff Workload</h2>
            <Link
              href="/staff"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Manage staff
            </Link>
          </div>
          {staff.length === 0 ? (
            <p className="text-gray-500">No staff members yet.</p>
          ) : (
            <div className="space-y-3">
              {staff.map((member) => {
                const percentage = member.totalAllocatedHours > 0
                  ? (member.totalLoggedHours / member.totalAllocatedHours) * 100
                  : 0
                const isOverAllocated = member.totalAllocatedHours > 40

                return (
                  <div key={member.id} className="p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className={`font-medium ${isOverAllocated ? 'text-red-600' : 'text-gray-900'}`}>
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-500">{member.role.roleName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {member.totalLoggedHours.toFixed(1)} / {member.totalAllocatedHours.toFixed(1)} hrs
                        </p>
                        <p className="text-sm text-gray-500">{percentage.toFixed(0)}% complete</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isOverAllocated ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string
  value: string | number
  subtitle: string
  color: 'blue' | 'green' | 'purple' | 'red' | 'gray'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
  }

  return (
    <div className={`rounded-lg p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-sm mt-1 opacity-75">{subtitle}</p>
    </div>
  )
}
