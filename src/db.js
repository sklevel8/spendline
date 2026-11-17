import Dexie from 'dexie'
import { addDays, toISODate } from './lib/dates'

export const DB_NAME = 'spendline-local'

export const db = new Dexie(DB_NAME)

db.version(1).stores({
  transactions: '++id, clientId, title, category, type, date, billingCycle',
})

function dateFromNow(daysAgo) {
  return toISODate(addDays(new Date(), -daysAgo))
}

export function buildSeedTransactions() {
  const seededAt = new Date().toISOString()

  const subscriptions = [
    {
      title: 'AWS Cloud Hosting',
      amount: 45,
      category: 'Infrastructure',
      type: 'subscription',
      billingCycle: 'monthly',
      active: true,
      date: dateFromNow(2),
    },
    {
      title: 'GitHub Copilot',
      amount: 10,
      category: 'Development',
      type: 'subscription',
      billingCycle: 'monthly',
      active: true,
      date: dateFromNow(6),
    },
    {
      title: 'Figma Professional',
      amount: 15,
      category: 'Design',
      type: 'subscription',
      billingCycle: 'monthly',
      active: true,
      date: dateFromNow(10),
    },
    {
      title: 'Vercel Pro',
      amount: 20,
      category: 'Infrastructure',
      type: 'subscription',
      billingCycle: 'monthly',
      active: true,
      date: dateFromNow(14),
    },
    {
      title: 'Linear',
      amount: 8,
      category: 'Productivity',
      type: 'subscription',
      billingCycle: 'monthly',
      active: true,
      date: dateFromNow(18),
    },
    {
      title: 'Notion Plus',
      amount: 96,
      category: 'Productivity',
      type: 'subscription',
      billingCycle: 'yearly',
      active: true,
      date: dateFromNow(23),
    },
    {
      title: 'Framer Pro',
      amount: 12,
      category: 'Design',
      type: 'subscription',
      billingCycle: 'monthly',
      active: true,
      date: dateFromNow(27),
    },
  ].map((record) => ({ ...record, createdAt: seededAt }))

  const expenses = [
    { title: 'Team dinner', amount: 128.5, category: 'Food', date: dateFromNow(1) },
    { title: 'Google Ads campaign', amount: 240, category: 'Marketing', date: dateFromNow(3) },
    { title: 'Domain renewal', amount: 12, category: 'Infrastructure', date: dateFromNow(5) },
    { title: 'Typeface license', amount: 29, category: 'Design', date: dateFromNow(7) },
    { title: 'Client lunch', amount: 68, category: 'Food', date: dateFromNow(9) },
    { title: 'Train to client', amount: 42, category: 'Travel', date: dateFromNow(12) },
    { title: 'Analytics course', amount: 49, category: 'Development', date: dateFromNow(16) },
    { title: 'Monitor stand', amount: 89, category: 'Other', date: dateFromNow(20) },
    { title: 'Coffee beans', amount: 18.5, category: 'Food', date: dateFromNow(24) },
    { title: 'Coworking day', amount: 25, category: 'Workspace', date: dateFromNow(28) },
    { title: 'Conference ticket', amount: 199, category: 'Development', date: dateFromNow(33) },
    { title: 'Client dinner', amount: 82, category: 'Food', date: dateFromNow(34) },
    { title: 'Retargeting ads', amount: 180, category: 'Marketing', date: dateFromNow(36) },
    { title: 'Icon set license', amount: 49, category: 'Design', date: dateFromNow(39) },
    { title: 'Train tickets', amount: 42, category: 'Travel', date: dateFromNow(42) },
    { title: 'SEO audit', amount: 79, category: 'Marketing', date: dateFromNow(45) },
    { title: 'Team offsite', amount: 320, category: 'Travel', date: dateFromNow(52) },
    { title: 'External SSD', amount: 139, category: 'Other', date: dateFromNow(63) },
    { title: 'Design workshop', amount: 250, category: 'Development', date: dateFromNow(72) },
    { title: 'Client dinner', amount: 94, category: 'Food', date: dateFromNow(85) },
    { title: 'Laptop repair', amount: 180, category: 'Infrastructure', date: dateFromNow(97) },
    { title: 'Campaign shoot', amount: 350, category: 'Marketing', date: dateFromNow(112) },
    { title: 'Coworking week', amount: 95, category: 'Workspace', date: dateFromNow(130) },
    { title: 'Flight to Cape Town', amount: 280, category: 'Travel', date: dateFromNow(150) },
    { title: 'Brand guidelines', amount: 420, category: 'Design', date: dateFromNow(178) },
    { title: 'Email platform', amount: 48, category: 'Marketing', date: dateFromNow(200) },
    { title: 'Desk chair', amount: 320, category: 'Workspace', date: dateFromNow(230) },
    { title: 'Cloud credits top-up', amount: 60, category: 'Infrastructure', date: dateFromNow(270) },
    { title: 'Design summit', amount: 450, category: 'Development', date: dateFromNow(300) },
  ].map((record) => ({
    ...record,
    type: 'expense',
    createdAt: seededAt,
  }))

  return [...subscriptions, ...expenses]
}

// Dexie calls this exactly once when the database is first created.
db.on('populate', () => db.transactions.bulkAdd(buildSeedTransactions()))

export async function resetDemoData() {
  await db.transactions.clear()
  return db.transactions.bulkAdd(buildSeedTransactions())
}
