import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default roles with allocation percentages
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { roleName: 'Project Manager' },
      update: {},
      create: {
        roleName: 'Project Manager',
        defaultAllocationPercentage: 10,
      },
    }),
    prisma.role.upsert({
      where: { roleName: 'Solution Architect' },
      update: {},
      create: {
        roleName: 'Solution Architect',
        defaultAllocationPercentage: 20,
      },
    }),
    prisma.role.upsert({
      where: { roleName: 'Business Analyst' },
      update: {},
      create: {
        roleName: 'Business Analyst',
        defaultAllocationPercentage: 30,
      },
    }),
    prisma.role.upsert({
      where: { roleName: 'Software Developer' },
      update: {},
      create: {
        roleName: 'Software Developer',
        defaultAllocationPercentage: 40,
      },
    }),
    prisma.role.upsert({
      where: { roleName: 'QA Engineer' },
      update: {},
      create: {
        roleName: 'QA Engineer',
        defaultAllocationPercentage: 25,
      },
    }),
  ])

  console.log('Created roles:', roles.map(r => r.roleName).join(', '))

  // Get roles by name
  const pmRole = roles.find(r => r.roleName === 'Project Manager')!
  const architectRole = roles.find(r => r.roleName === 'Solution Architect')!
  const baRole = roles.find(r => r.roleName === 'Business Analyst')!
  const devRole = roles.find(r => r.roleName === 'Software Developer')!
  const qaRole = roles.find(r => r.roleName === 'QA Engineer')!

  // Create sample staff members with full profiles
  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { id: 'staff-alice' },
      update: {},
      create: {
        id: 'staff-alice',
        name: 'Alice Johnson',
        title: 'Senior Project Manager',
        roleId: pmRole.id,
        hourlyCost: 150,
        hoursQuota: 40,
        email: 'alice.johnson@company.com',
        phone: '+1 555-0101',
        bio: 'Alice is an experienced Project Manager with over 12 years of experience leading cross-functional teams. She specializes in agile methodologies and has successfully delivered projects ranging from small startups to enterprise-level implementations.',
        executiveSummary: 'Seasoned project management professional with a proven track record in delivering complex technology projects on time and within budget. Expert in stakeholder management, risk mitigation, and team leadership. PMP and Scrum Master certified with experience across multiple industries including finance, healthcare, and technology.',
        skills: JSON.stringify(['Project Management', 'Agile/Scrum', 'Risk Management', 'Stakeholder Management', 'Budget Planning', 'Team Leadership']),
        education: JSON.stringify([
          { degree: 'MBA', institution: 'Stanford University', year: '2012' },
          { degree: 'BS Computer Science', institution: 'MIT', year: '2008' }
        ]),
        experience: JSON.stringify([
          { company: 'Tech Corp', role: 'Senior PM', duration: '2018-Present', description: 'Leading enterprise software projects' },
          { company: 'Innovate Inc', role: 'Project Manager', duration: '2014-2018', description: 'Managed agile teams' }
        ]),
        certifications: JSON.stringify(['PMP', 'Certified Scrum Master', 'PRINCE2']),
      },
    }),
    prisma.staff.upsert({
      where: { id: 'staff-bob' },
      update: {},
      create: {
        id: 'staff-bob',
        name: 'Bob Smith',
        title: 'Lead Solution Architect',
        roleId: architectRole.id,
        hourlyCost: 175,
        hoursQuota: 45,
        email: 'bob.smith@company.com',
        phone: '+1 555-0102',
        bio: 'Bob is a Lead Solution Architect with 15 years of experience designing scalable enterprise systems. He specializes in cloud architecture, microservices, and distributed systems.',
        executiveSummary: 'Distinguished technology leader with extensive experience in designing and implementing enterprise-scale solutions. Expert in cloud-native architectures, system integration, and technical strategy. Has led architectural initiatives for Fortune 500 companies and successfully migrated legacy systems to modern cloud platforms.',
        skills: JSON.stringify(['Cloud Architecture', 'AWS', 'Azure', 'Microservices', 'System Design', 'Docker', 'Kubernetes']),
        education: JSON.stringify([
          { degree: 'MS Computer Science', institution: 'Carnegie Mellon', year: '2010' },
          { degree: 'BS Software Engineering', institution: 'UC Berkeley', year: '2007' }
        ]),
        experience: JSON.stringify([
          { company: 'Tech Corp', role: 'Lead Architect', duration: '2019-Present', description: 'Designing cloud solutions' },
          { company: 'Cloud Systems Inc', role: 'Senior Architect', duration: '2015-2019', description: 'AWS migrations' }
        ]),
        certifications: JSON.stringify(['AWS Solutions Architect Professional', 'Azure Solutions Architect', 'TOGAF']),
      },
    }),
    prisma.staff.upsert({
      where: { id: 'staff-carol' },
      update: {},
      create: {
        id: 'staff-carol',
        name: 'Carol Williams',
        title: 'Senior Business Analyst',
        roleId: baRole.id,
        hourlyCost: 125,
        hoursQuota: 40,
        email: 'carol.williams@company.com',
        phone: '+1 555-0103',
        bio: 'Carol is a Senior Business Analyst with expertise in requirements gathering, process optimization, and stakeholder communication. She has 8 years of experience bridging the gap between business and technology.',
        executiveSummary: 'Results-driven business analyst with strong analytical and communication skills. Proven ability to translate complex business requirements into actionable technical specifications. Experience with various industries and methodologies.',
        skills: JSON.stringify(['Requirements Analysis', 'Process Modeling', 'SQL', 'Data Analysis', 'User Stories', 'JIRA']),
        education: JSON.stringify([
          { degree: 'MBA', institution: 'Northwestern Kellogg', year: '2016' },
          { degree: 'BS Business Administration', institution: 'University of Michigan', year: '2013' }
        ]),
        experience: JSON.stringify([
          { company: 'Tech Corp', role: 'Senior BA', duration: '2020-Present', description: 'Leading requirements analysis' },
          { company: 'Consulting Group', role: 'Business Analyst', duration: '2016-2020', description: 'Client consulting' }
        ]),
        certifications: JSON.stringify(['CBAP', 'Six Sigma Green Belt']),
      },
    }),
    prisma.staff.upsert({
      where: { id: 'staff-dave' },
      update: {},
      create: {
        id: 'staff-dave',
        name: 'Dave Brown',
        title: 'Senior Full Stack Developer',
        roleId: devRole.id,
        hourlyCost: 140,
        hoursQuota: 40,
        email: 'dave.brown@company.com',
        phone: '+1 555-0104',
        bio: 'Dave is a Senior Full Stack Developer with 10 years of experience building modern web applications. He specializes in React, Node.js, and cloud-native development.',
        executiveSummary: 'Highly skilled full-stack developer with expertise in modern JavaScript frameworks and cloud technologies. Strong advocate for clean code, test-driven development, and continuous integration practices.',
        skills: JSON.stringify(['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL']),
        education: JSON.stringify([
          { degree: 'MS Software Engineering', institution: 'Georgia Tech', year: '2014' },
          { degree: 'BS Computer Science', institution: 'Purdue University', year: '2012' }
        ]),
        experience: JSON.stringify([
          { company: 'Tech Corp', role: 'Senior Developer', duration: '2019-Present', description: 'Full stack development' },
          { company: 'StartupXYZ', role: 'Developer', duration: '2015-2019', description: 'Building web apps' }
        ]),
        certifications: JSON.stringify(['AWS Developer Associate', 'MongoDB Certified Developer']),
      },
    }),
    prisma.staff.upsert({
      where: { id: 'staff-eve' },
      update: {},
      create: {
        id: 'staff-eve',
        name: 'Eve Davis',
        title: 'Software Developer',
        roleId: devRole.id,
        hourlyCost: 120,
        hoursQuota: 40,
        email: 'eve.davis@company.com',
        phone: '+1 555-0105',
        bio: 'Eve is a Software Developer with 5 years of experience focused on backend development and API design. She is passionate about writing clean, maintainable code.',
        executiveSummary: 'Dedicated software developer with strong backend development skills. Experience with RESTful APIs, database design, and microservices architecture. Committed to continuous learning and best practices.',
        skills: JSON.stringify(['Python', 'Java', 'REST APIs', 'PostgreSQL', 'Redis', 'Git']),
        education: JSON.stringify([
          { degree: 'BS Computer Science', institution: 'UCLA', year: '2019' }
        ]),
        experience: JSON.stringify([
          { company: 'Tech Corp', role: 'Developer', duration: '2021-Present', description: 'Backend development' },
          { company: 'Digital Agency', role: 'Junior Developer', duration: '2019-2021', description: 'API development' }
        ]),
        certifications: JSON.stringify(['Oracle Java SE 11 Developer']),
      },
    }),
    prisma.staff.upsert({
      where: { id: 'staff-frank' },
      update: {},
      create: {
        id: 'staff-frank',
        name: 'Frank Miller',
        title: 'QA Lead',
        roleId: qaRole.id,
        hourlyCost: 110,
        hoursQuota: 40,
        email: 'frank.miller@company.com',
        phone: '+1 555-0106',
        bio: 'Frank is a QA Lead with 7 years of experience in software testing and quality assurance. He specializes in test automation and CI/CD integration.',
        executiveSummary: 'Experienced QA professional with expertise in both manual and automated testing. Strong knowledge of testing frameworks, performance testing, and quality processes. Led QA initiatives for multiple successful product launches.',
        skills: JSON.stringify(['Selenium', 'Cypress', 'Jest', 'Performance Testing', 'CI/CD', 'Test Planning']),
        education: JSON.stringify([
          { degree: 'BS Information Technology', institution: 'Arizona State', year: '2017' }
        ]),
        experience: JSON.stringify([
          { company: 'Tech Corp', role: 'QA Lead', duration: '2020-Present', description: 'Leading QA team' },
          { company: 'QA Services', role: 'QA Engineer', duration: '2017-2020', description: 'Test automation' }
        ]),
        certifications: JSON.stringify(['ISTQB Advanced Level', 'AWS Cloud Practitioner']),
      },
    }),
  ])

  console.log('Created staff:', staff.map(s => s.name).join(', '))

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: 'project-website' },
      update: {},
      create: {
        id: 'project-website',
        name: 'Corporate Website Redesign',
        description: 'Complete redesign of the corporate website with modern UI/UX, improved performance, and mobile responsiveness.',
        status: 'ACTIVE',
        dealSize: 75000,
        blendedRate: 125,
        totalHours: 600,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
        periodMonths: 6,
        techStack: JSON.stringify(['React', 'Next.js', 'Tailwind CSS', 'PostgreSQL', 'AWS']),
        enduserName: 'Acme Corporation',
        partnerName: 'Digital Partners Inc',
      },
    }),
    prisma.project.upsert({
      where: { id: 'project-crm' },
      update: {},
      create: {
        id: 'project-crm',
        name: 'CRM System Implementation',
        description: 'Implementation of a custom CRM system to replace legacy tools and improve sales team productivity.',
        status: 'ACTIVE',
        dealSize: 150000,
        blendedRate: 140,
        totalHours: 1071,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-09-30'),
        periodMonths: 8,
        techStack: JSON.stringify(['Node.js', 'React', 'MongoDB', 'Redis', 'Docker']),
        enduserName: 'Global Sales Inc',
        partnerName: 'Enterprise Solutions',
      },
    }),
    prisma.project.upsert({
      where: { id: 'project-mobile' },
      update: {},
      create: {
        id: 'project-mobile',
        name: 'Mobile App Development',
        description: 'Development of iOS and Android mobile applications for customer engagement and loyalty program.',
        status: 'ACTIVE',
        dealSize: 100000,
        blendedRate: 130,
        totalHours: 769,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-08-31'),
        periodMonths: 6,
        techStack: JSON.stringify(['React Native', 'TypeScript', 'Firebase', 'Node.js']),
        enduserName: 'Retail Chain Co',
      },
    }),
  ])

  console.log('Created projects:', projects.map(p => p.name).join(', '))

  // Create assignments
  const websiteProject = projects.find(p => p.name === 'Corporate Website Redesign')!
  const crmProject = projects.find(p => p.name === 'CRM System Implementation')!
  const mobileProject = projects.find(p => p.name === 'Mobile App Development')!

  const alice = staff.find(s => s.name === 'Alice Johnson')!
  const bob = staff.find(s => s.name === 'Bob Smith')!
  const carol = staff.find(s => s.name === 'Carol Williams')!
  const dave = staff.find(s => s.name === 'Dave Brown')!
  const eve = staff.find(s => s.name === 'Eve Davis')!
  const frank = staff.find(s => s.name === 'Frank Miller')!

  const assignments = await Promise.all([
    // Website project assignments
    prisma.assignment.upsert({
      where: { id: 'assign-website-alice' },
      update: {},
      create: {
        id: 'assign-website-alice',
        projectId: websiteProject.id,
        staffId: alice.id,
        roleId: pmRole.id,
        allocatedHours: 60,
        loggedHours: 35,
      },
    }),
    prisma.assignment.upsert({
      where: { id: 'assign-website-bob' },
      update: {},
      create: {
        id: 'assign-website-bob',
        projectId: websiteProject.id,
        staffId: bob.id,
        roleId: architectRole.id,
        allocatedHours: 80,
        loggedHours: 50,
      },
    }),
    prisma.assignment.upsert({
      where: { id: 'assign-website-dave' },
      update: {},
      create: {
        id: 'assign-website-dave',
        projectId: websiteProject.id,
        staffId: dave.id,
        roleId: devRole.id,
        allocatedHours: 300,
        loggedHours: 180,
      },
    }),
    prisma.assignment.upsert({
      where: { id: 'assign-website-frank' },
      update: {},
      create: {
        id: 'assign-website-frank',
        projectId: websiteProject.id,
        staffId: frank.id,
        roleId: qaRole.id,
        allocatedHours: 100,
        loggedHours: 45,
      },
    }),
    // CRM project assignments
    prisma.assignment.upsert({
      where: { id: 'assign-crm-alice' },
      update: {},
      create: {
        id: 'assign-crm-alice',
        projectId: crmProject.id,
        staffId: alice.id,
        roleId: pmRole.id,
        allocatedHours: 100,
        loggedHours: 40,
      },
    }),
    prisma.assignment.upsert({
      where: { id: 'assign-crm-carol' },
      update: {},
      create: {
        id: 'assign-crm-carol',
        projectId: crmProject.id,
        staffId: carol.id,
        roleId: baRole.id,
        allocatedHours: 200,
        loggedHours: 85,
      },
    }),
    prisma.assignment.upsert({
      where: { id: 'assign-crm-eve' },
      update: {},
      create: {
        id: 'assign-crm-eve',
        projectId: crmProject.id,
        staffId: eve.id,
        roleId: devRole.id,
        allocatedHours: 400,
        loggedHours: 150,
      },
    }),
    prisma.assignment.upsert({
      where: { id: 'assign-crm-bob' },
      update: {},
      create: {
        id: 'assign-crm-bob',
        projectId: crmProject.id,
        staffId: bob.id,
        roleId: architectRole.id,
        allocatedHours: 120,
        loggedHours: 60,
      },
    }),
    // Mobile project assignments
    prisma.assignment.upsert({
      where: { id: 'assign-mobile-carol' },
      update: {},
      create: {
        id: 'assign-mobile-carol',
        projectId: mobileProject.id,
        staffId: carol.id,
        roleId: baRole.id,
        allocatedHours: 100,
        loggedHours: 30,
      },
    }),
    prisma.assignment.upsert({
      where: { id: 'assign-mobile-dave' },
      update: {},
      create: {
        id: 'assign-mobile-dave',
        projectId: mobileProject.id,
        staffId: dave.id,
        roleId: devRole.id,
        allocatedHours: 350,
        loggedHours: 100,
      },
    }),
    prisma.assignment.upsert({
      where: { id: 'assign-mobile-frank' },
      update: {},
      create: {
        id: 'assign-mobile-frank',
        projectId: mobileProject.id,
        staffId: frank.id,
        roleId: qaRole.id,
        allocatedHours: 150,
        loggedHours: 35,
      },
    }),
  ])

  console.log('Created assignments:', assignments.length)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
