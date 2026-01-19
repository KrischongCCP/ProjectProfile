const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.role.findMany().then(r => {
  console.log(JSON.stringify(r.map(x => ({ name: x.roleName, pct: Number(x.defaultAllocationPercentage) })), null, 2));
  p.();
});
