import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import data from '../data/seed-data.json' with { type: 'json' };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // clear all data
  console.log('Clearing all data...');
  await prisma.payments.deleteMany();
  await prisma.invoices.deleteMany();
  await prisma.customers.deleteMany();

  // import data from json file
  // since we create new uuid when inserting, we need to map old id to new uuid
  const { customers, invoices, payments } = data;

  // seed customer data
  console.log('Seeding data...');
  console.log('Seeding customers...');
  const customerMap = new Map();
  for (const c of customers) {
    const created = await prisma.customers.create({ data: { name: c.name } });
    if (created) customerMap.set(c.id, created.id);
  }
  console.log(`Seeded ${customerMap.size} customers`);

  // seed invoice data
  console.log('Seeding invoices...');
  const invoiceMap = new Map();
  for (const i of invoices) {
    const created = await prisma.invoices.create({
      data: {
        customer_id: customerMap.get(i.customer_id),
        amount: i.amount,
        currency: i.currency,
        issued_at: i.issued_at,
        due_at: i.due_at,
        status: i.status,
      },
    });
    if (created) invoiceMap.set(i.id, created.id);
  }
  console.log(`Seeded ${invoiceMap.size} invoices`);

  console.log('Seeding payments...');
  const paymentMap = new Map();
  for (const p of payments) {
    const created = await prisma.payments.create({
      data: {
        invoice_id: invoiceMap.get(p.invoice_id),
        amount: p.amount,
        paid_at: p.paid_at,
      },
    });
    if (created) paymentMap.set(p.id, created.id);
  }
  console.log(`Seeded ${paymentMap.size} payments`);
}

main()
  .then(async () => {
    console.log('Data seeded successfully');
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Error seeding data:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
