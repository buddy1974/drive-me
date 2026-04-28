/**
 * Demo seed — populates realistic data for investor demo.
 *
 * Run against production:
 *   DATABASE_URL="<render-postgres-url>" npx ts-node -e "require('./prisma/seed-demo')"
 *
 * Or from repo root:
 *   cd apps/api && DATABASE_URL="..." npx ts-node --project tsconfig.json prisma/seed-demo.ts
 *
 * Safe to re-run: uses skipDuplicates / upsert throughout.
 * Does NOT touch the AdminUser table.
 */

import {
  PrismaClient,
  AgentStatus,
  VehicleType,
  JobStatus,
  ServiceType,
  PaymentMethod,
  PaymentStatus,
  PayoutStatus,
  VerificationStatus,
  VerificationMethod,
  ActorType,
} from '@prisma/client'

const prisma = new PrismaClient()

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function hoursAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 60 * 1000)
}

// ─── Reference data ──────────────────────────────────────────────────────────

const QUARTERS = [
  { quarter: 'Biyem-Assi',   lat: 3.8234, lng: 11.4901 },
  { quarter: 'Bastos',        lat: 3.8652, lng: 11.5107 },
  { quarter: 'Mfandena',      lat: 3.8456, lng: 11.5234 },
  { quarter: 'Nlongkak',      lat: 3.8589, lng: 11.5067 },
  { quarter: 'Essos',         lat: 3.8321, lng: 11.5456 },
  { quarter: 'Ekounou',       lat: 3.8123, lng: 11.5234 },
  { quarter: 'Mendong',       lat: 3.8012, lng: 11.5123 },
  { quarter: 'Mvog-Mbi',      lat: 3.8734, lng: 11.5234 },
  { quarter: 'Elig-Essono',   lat: 3.8612, lng: 11.4978 },
  { quarter: 'Ngousso',       lat: 3.8901, lng: 11.5312 },
]

const AGENT_DATA = [
  { phone: '+237690001001', name: 'Emmanuel Nkoa',     vehicle: VehicleType.MOTORBIKE, plate: 'LT 4821 A', make: 'Yamaha',  model: 'YBR125',   year: 2021, status: AgentStatus.ONLINE,                momoPhone: '+237690001001' },
  { phone: '+237690001002', name: 'François Bikele',   vehicle: VehicleType.MOTORBIKE, plate: 'LT 3302 B', make: 'Honda',   model: 'CB125',    year: 2020, status: AgentStatus.ONLINE,                momoPhone: '+237690001002' },
  { phone: '+237690001003', name: 'Mireille Essama',   vehicle: VehicleType.ON_FOOT,   plate: 'N/A',       make: 'N/A',     model: 'N/A',      year: 2024, status: AgentStatus.ONLINE,                momoPhone: '+237690001003' },
  { phone: '+237690001004', name: 'Boris Minko',       vehicle: VehicleType.MOTORBIKE, plate: 'LT 7714 C', make: 'Suzuki',  model: 'GD110',    year: 2022, status: AgentStatus.ONLINE,                momoPhone: '+237690001004' },
  { phone: '+237690001005', name: 'Joëlle Ango',       vehicle: VehicleType.CAR,       plate: 'LT 2218 D', make: 'Toyota',  model: 'Corolla',  year: 2019, status: AgentStatus.ONLINE,                momoPhone: '+237690001005' },
  { phone: '+237690001006', name: 'Ghislain Obam',     vehicle: VehicleType.MOTORBIKE, plate: 'LT 9934 E', make: 'Yamaha',  model: 'Saluto',   year: 2020, status: AgentStatus.ONLINE,                momoPhone: '+237690001006' },
  { phone: '+237690001007', name: 'Nadège Abanda',     vehicle: VehicleType.ON_FOOT,   plate: 'N/A',       make: 'N/A',     model: 'N/A',      year: 2024, status: AgentStatus.ONLINE,                momoPhone: '+237690001007' },
  { phone: '+237690001008', name: 'Thierry Messi',     vehicle: VehicleType.MOTORBIKE, plate: 'LT 5521 F', make: 'Honda',   model: 'XR150',    year: 2021, status: AgentStatus.ONLINE,                momoPhone: '+237690001008' },
  { phone: '+237690001009', name: 'Céline Mvondo',     vehicle: VehicleType.CAR,       plate: 'LT 1102 G', make: 'Kia',     model: 'Picanto',  year: 2018, status: AgentStatus.OFFLINE,               momoPhone: '+237690001009' },
  { phone: '+237690001010', name: 'Roger Fouda',       vehicle: VehicleType.MOTORBIKE, plate: 'LT 8823 H', make: 'Yamaha',  model: 'YBR125',   year: 2022, status: AgentStatus.OFFLINE,               momoPhone: '+237690001010' },
  { phone: '+237690001011', name: 'Brigitte Owona',    vehicle: VehicleType.ON_FOOT,   plate: 'N/A',       make: 'N/A',     model: 'N/A',      year: 2023, status: AgentStatus.OFFLINE,               momoPhone: '+237690001011' },
  { phone: '+237690001012', name: 'Alain Tsala',       vehicle: VehicleType.CAR,       plate: 'LT 4430 I', make: 'Hyundai', model: 'i10',      year: 2020, status: AgentStatus.OFFLINE,               momoPhone: '+237690001012' },
  { phone: '+237690001013', name: 'Sandrine Bella',    vehicle: VehicleType.MOTORBIKE, plate: 'LT 6617 J', make: 'Suzuki',  model: 'GD110',    year: 2023, status: AgentStatus.PENDING_VERIFICATION,  momoPhone: null },
  { phone: '+237690001014', name: 'Patrick Engonga',   vehicle: VehicleType.CAR,       plate: 'LT 3391 K', make: 'Toyota',  model: 'Vitz',     year: 2017, status: AgentStatus.PENDING_VERIFICATION,  momoPhone: null },
]

const USER_DATA = [
  { phone: '+237691001001', name: 'Jean-Baptiste Onana' },
  { phone: '+237691001002', name: 'Marie Ekambi' },
  { phone: '+237691001003', name: 'Bertrand Mbarga' },
  { phone: '+237691001004', name: 'Solange Ateba' },
  { phone: '+237691001005', name: 'Pierre Fouda' },
  { phone: '+237691001006', name: 'Aline Ngo Biyong' },
  { phone: '+237691001007', name: 'Christophe Abomo' },
  { phone: '+237691001008', name: 'Flore Tsimi' },
  { phone: '+237691001009', name: 'Paul Bilong' },
  { phone: '+237691001010', name: 'Rose-Marie Essomba' },
  { phone: '+237691001011', name: 'Norbert Kouna' },
  { phone: '+237691001012', name: 'Laurence Mbem' },
  { phone: '+237691001013', name: 'Gaston Nkodo' },
  { phone: '+237691001014', name: 'Véronique Nkeng' },
  { phone: '+237691001015', name: 'Serge Mballa' },
  { phone: '+237691001016', name: 'Hortense Ayissi' },
  { phone: '+237691001017', name: 'Alphonse Zanga' },
  { phone: '+237691001018', name: 'Clarisse Biyong' },
  { phone: '+237691001019', name: 'Marcel Nguini' },
  { phone: '+237691001020', name: 'Odette Ombolo' },
  { phone: '+237691001021', name: 'Théodore Menye' },
  { phone: '+237691001022', name: 'Nathalie Etoa' },
  { phone: '+237691001023', name: 'Achille Nsom' },
  { phone: '+237691001024', name: 'Justine Etoundi' },
  { phone: '+237691001025', name: 'Gérard Manga' },
  { phone: '+237691001026', name: 'Isabelle Wamba' },
  { phone: '+237691001027', name: 'Hyacinthe Bela' },
  { phone: '+237691001028', name: 'Chantal Owono' },
  { phone: '+237691001029', name: 'Robert Minkoumou' },
  { phone: '+237691001030', name: 'Élise Nlend' },
  { phone: '+237691001031', name: 'Sylvain Ondoa' },
  { phone: '+237691001032', name: 'Perpetua Essama' },
  { phone: '+237691001033', name: 'Dieudonné Abena' },
  { phone: '+237691001034', name: 'Angèle Mebodo' },
  { phone: '+237691001035', name: 'Oscar Nganou' },
  { phone: '+237691001036', name: 'Marthe Mbito' },
  { phone: '+237691001037', name: 'Léon Bikele' },
  { phone: '+237691001038', name: 'Félicité Nkoulou' },
  { phone: '+237691001039', name: 'Armel Tazo' },
  { phone: '+237691001040', name: 'Suzanne Amougou' },
  { phone: '+237691001041', name: 'Hugo Mvondo' },
  { phone: '+237691001042', name: 'Beatrice Obiang' },
  { phone: '+237691001043', name: 'Fabrice Nguema' },
  { phone: '+237691001044', name: 'Antoinette Bengono' },
  { phone: '+237691001045', name: 'Romain Nlom' },
  { phone: '+237691001046', name: 'Lucie Andong' },
  { phone: '+237691001047', name: 'Stéphane Ekoto' },
]

// Completed jobs with realistic prices (XAF)
// Total of these PAID amounts = 187,500 XAF platform revenue
const COMPLETED_JOB_SPECS = [
  { desc: 'Collect MTN MoMo transfer at Biyem-Assi agency and bring receipt',                          svc: ServiceType.ERRAND,   price: 2000, method: PaymentMethod.MTN_MOMO,     userIdx: 0,  agentIdx: 0,  daysAgo: 3  },
  { desc: 'Buy tomatoes and onions at Marché du Mfoundi, deliver home',                                svc: ServiceType.DELIVERY, price: 2500, method: PaymentMethod.CASH,         userIdx: 1,  agentIdx: 1,  daysAgo: 3  },
  { desc: 'Pay AES Sonel electricity bill at Nlongkak office',                                         svc: ServiceType.ERRAND,   price: 1500, method: PaymentMethod.ORANGE_MONEY, userIdx: 2,  agentIdx: 2,  daysAgo: 4  },
  { desc: 'Pick up DHL package at Carrefour Warda, deliver to Bastos',                                 svc: ServiceType.PICKUP,   price: 4500, method: PaymentMethod.MTN_MOMO,     userIdx: 3,  agentIdx: 3,  daysAgo: 4  },
  { desc: 'Queue and collect national ID card from DGSN, Centre-ville',                                svc: ServiceType.ERRAND,   price: 3000, method: PaymentMethod.CASH,         userIdx: 4,  agentIdx: 4,  daysAgo: 5  },
  { desc: 'Deliver urgent legal documents to notary office in Bastos',                                 svc: ServiceType.DELIVERY, price: 3500, method: PaymentMethod.MTN_MOMO,     userIdx: 5,  agentIdx: 5,  daysAgo: 5  },
  { desc: 'Buy prescription medicines from Pharmacie de la Gare and deliver',                          svc: ServiceType.ERRAND,   price: 2000, method: PaymentMethod.ORANGE_MONEY, userIdx: 6,  agentIdx: 6,  daysAgo: 6  },
  { desc: 'Pay school fees at Lycée de Nkolbisson for 3rd trimester',                                  svc: ServiceType.ERRAND,   price: 2500, method: PaymentMethod.CASH,         userIdx: 7,  agentIdx: 7,  daysAgo: 6  },
  { desc: 'Pick up package from Chronopost agency at Carrefour Obili',                                 svc: ServiceType.PICKUP,   price: 3000, method: PaymentMethod.MTN_MOMO,     userIdx: 8,  agentIdx: 0,  daysAgo: 7  },
  { desc: 'Buy 5000 XAF MTN airtime and recharge my number',                                           svc: ServiceType.ERRAND,   price: 1500, method: PaymentMethod.MTN_MOMO,     userIdx: 9,  agentIdx: 1,  daysAgo: 7  },
  { desc: 'Collect salary confirmation letter from BEAC office',                                       svc: ServiceType.ERRAND,   price: 2000, method: PaymentMethod.ORANGE_MONEY, userIdx: 10, agentIdx: 2,  daysAgo: 8  },
  { desc: 'Deliver birthday cake from Pâtisserie des Amis to Mfandena',                                svc: ServiceType.DELIVERY, price: 4000, method: PaymentMethod.CASH,         userIdx: 11, agentIdx: 3,  daysAgo: 8  },
  { desc: 'Pay water bill at CAMWATER office near Rond-point Express',                                 svc: ServiceType.ERRAND,   price: 1500, method: PaymentMethod.MTN_MOMO,     userIdx: 12, agentIdx: 4,  daysAgo: 9  },
  { desc: 'Queue at prefecture for document legalization — bring receipt',                              svc: ServiceType.ERRAND,   price: 3500, method: PaymentMethod.ORANGE_MONEY, userIdx: 13, agentIdx: 5,  daysAgo: 9  },
  { desc: 'Pick up child from Ecole Publique de Nlongkak at 15h30',                                    svc: ServiceType.PICKUP,   price: 5000, method: PaymentMethod.CASH,         userIdx: 14, agentIdx: 6,  daysAgo: 10 },
  { desc: 'Buy groceries: 2 poulets, riz, huile — Marché Mokolo',                                      svc: ServiceType.ERRAND,   price: 3000, method: PaymentMethod.MTN_MOMO,     userIdx: 15, agentIdx: 7,  daysAgo: 10 },
  { desc: 'Deliver USB key with documents to colleague in Ekounou',                                    svc: ServiceType.DELIVERY, price: 2500, method: PaymentMethod.ORANGE_MONEY, userIdx: 16, agentIdx: 8,  daysAgo: 11 },
  { desc: 'Renew driving licence at DGSN annexe — full day errand',                                    svc: ServiceType.ERRAND,   price: 5500, method: PaymentMethod.CASH,         userIdx: 17, agentIdx: 9,  daysAgo: 11 },
  { desc: 'Collect Western Union transfer from Express Exchange Biyem-Assi',                           svc: ServiceType.ERRAND,   price: 2000, method: PaymentMethod.MTN_MOMO,     userIdx: 18, agentIdx: 10, daysAgo: 12 },
  { desc: 'Deliver signed contract documents to law firm in Bastos',                                   svc: ServiceType.DELIVERY, price: 4500, method: PaymentMethod.ORANGE_MONEY, userIdx: 19, agentIdx: 11, daysAgo: 12 },
  { desc: 'Pick up spare parts order from Nkoldongo auto parts district',                              svc: ServiceType.PICKUP,   price: 3500, method: PaymentMethod.CASH,         userIdx: 20, agentIdx: 0,  daysAgo: 13 },
  { desc: 'Buy school supplies list from Librairie des Arts et Techniques',                            svc: ServiceType.ERRAND,   price: 2000, method: PaymentMethod.MTN_MOMO,     userIdx: 21, agentIdx: 1,  daysAgo: 13 },
  { desc: 'Pay Canal+ subscription at agency near Mvog-Ada',                                           svc: ServiceType.ERRAND,   price: 1500, method: PaymentMethod.ORANGE_MONEY, userIdx: 22, agentIdx: 2,  daysAgo: 14 },
  { desc: 'Deliver printed architectural plans to site office in Mendong',                             svc: ServiceType.DELIVERY, price: 3000, method: PaymentMethod.CASH,         userIdx: 23, agentIdx: 3,  daysAgo: 14 },
  { desc: 'Queue at social security office (CNPS) — pick up pension slip',                             svc: ServiceType.ERRAND,   price: 4000, method: PaymentMethod.MTN_MOMO,     userIdx: 24, agentIdx: 4,  daysAgo: 15 },
  { desc: 'Collect phone repair from mobile workshop in Mfoundi',                                      svc: ServiceType.PICKUP,   price: 2000, method: PaymentMethod.ORANGE_MONEY, userIdx: 25, agentIdx: 5,  daysAgo: 15 },
  { desc: 'Buy cooking gas cylinder 12kg and deliver to Ngousso residence',                            svc: ServiceType.ERRAND,   price: 3500, method: PaymentMethod.CASH,         userIdx: 26, agentIdx: 6,  daysAgo: 16 },
  { desc: 'Deliver wedding invitation cards to 8 addresses in Biyem-Assi',                             svc: ServiceType.DELIVERY, price: 6000, method: PaymentMethod.MTN_MOMO,     userIdx: 27, agentIdx: 7,  daysAgo: 16 },
  { desc: 'Pay income tax at Centre des Impôts de Yaoundé 3',                                         svc: ServiceType.ERRAND,   price: 3000, method: PaymentMethod.ORANGE_MONEY, userIdx: 28, agentIdx: 8,  daysAgo: 17 },
  { desc: 'Pick up tailored suit from atelier in Elig-Essono',                                        svc: ServiceType.PICKUP,   price: 2500, method: PaymentMethod.CASH,         userIdx: 29, agentIdx: 9,  daysAgo: 17 },
  { desc: 'Renew car insurance at NSIA bureau, Hippodrome',                                            svc: ServiceType.ERRAND,   price: 2000, method: PaymentMethod.MTN_MOMO,     userIdx: 30, agentIdx: 10, daysAgo: 18 },
  { desc: 'Deliver medicine package to elderly parent in Essos',                                       svc: ServiceType.DELIVERY, price: 2000, method: PaymentMethod.ORANGE_MONEY, userIdx: 31, agentIdx: 11, daysAgo: 18 },
  { desc: 'Buy fabric at Marché des Femmes and deliver to tailor in Mfandena',                        svc: ServiceType.ERRAND,   price: 3500, method: PaymentMethod.CASH,         userIdx: 32, agentIdx: 0,  daysAgo: 19 },
  { desc: 'Queue for COVID attestation documents at Hôpital Central',                                  svc: ServiceType.ERRAND,   price: 4500, method: PaymentMethod.MTN_MOMO,     userIdx: 33, agentIdx: 1,  daysAgo: 19 },
  { desc: 'Collect airline ticket printout from travel agency in Centre-ville',                        svc: ServiceType.PICKUP,   price: 2000, method: PaymentMethod.ORANGE_MONEY, userIdx: 34, agentIdx: 2,  daysAgo: 20 },
  { desc: 'Deliver signed lease agreement to landlord in Ekounou',                                    svc: ServiceType.DELIVERY, price: 3000, method: PaymentMethod.CASH,         userIdx: 35, agentIdx: 3,  daysAgo: 20 },
  { desc: 'Pay water bill and collect receipt from CAMWATER at Kondengui',                             svc: ServiceType.ERRAND,   price: 1500, method: PaymentMethod.MTN_MOMO,     userIdx: 36, agentIdx: 4,  daysAgo: 21 },
  { desc: 'Buy printer cartridges at Informatique Plus near Carrefour Nlongkak',                       svc: ServiceType.ERRAND,   price: 2500, method: PaymentMethod.ORANGE_MONEY, userIdx: 37, agentIdx: 5,  daysAgo: 21 },
  { desc: 'Pick up daughter from piano lesson at Centre Culturel Français',                            svc: ServiceType.PICKUP,   price: 3500, method: PaymentMethod.CASH,         userIdx: 38, agentIdx: 6,  daysAgo: 22 },
  { desc: 'Deliver 3 boxes of promotional flyers to NGO office in Bastos',                             svc: ServiceType.DELIVERY, price: 4000, method: PaymentMethod.MTN_MOMO,     userIdx: 39, agentIdx: 7,  daysAgo: 22 },
  { desc: 'Buy and deliver 2 bags of cement from hardware store to Mendong site',                      svc: ServiceType.ERRAND,   price: 5000, method: PaymentMethod.ORANGE_MONEY, userIdx: 40, agentIdx: 8,  daysAgo: 23 },
  { desc: 'Collect notarized birth certificate from Mairie du 3ème',                                   svc: ServiceType.ERRAND,   price: 2000, method: PaymentMethod.CASH,         userIdx: 41, agentIdx: 9,  daysAgo: 23 },
  { desc: 'Deliver USB internet router to customer in Essos',                                          svc: ServiceType.DELIVERY, price: 3000, method: PaymentMethod.MTN_MOMO,     userIdx: 42, agentIdx: 10, daysAgo: 24 },
  { desc: 'Pay university tuition at UYI Ngoa-Ekelle campus cashier',                                 svc: ServiceType.ERRAND,   price: 3500, method: PaymentMethod.ORANGE_MONEY, userIdx: 43, agentIdx: 11, daysAgo: 24 },
  { desc: 'Pick up custom rubber stamps from printing shop near Carrefour Nlongkak',                   svc: ServiceType.PICKUP,   price: 2000, method: PaymentMethod.CASH,         userIdx: 44, agentIdx: 0,  daysAgo: 25 },
  { desc: 'Deliver breakfast — mandazi, beignets, café — to office in Mfandena',                       svc: ServiceType.DELIVERY, price: 2500, method: PaymentMethod.MTN_MOMO,     userIdx: 45, agentIdx: 1,  daysAgo: 25 },
  { desc: 'Queue at Tax office to obtain attestation de non-imposition',                               svc: ServiceType.ERRAND,   price: 4000, method: PaymentMethod.ORANGE_MONEY, userIdx: 46, agentIdx: 2,  daysAgo: 26 },
  { desc: 'Buy fresh fish at Marché du poisson de Mvan and deliver to Ngousso',                       svc: ServiceType.ERRAND,   price: 2500, method: PaymentMethod.CASH,         userIdx: 0,  agentIdx: 3,  daysAgo: 26 },
  { desc: 'Deliver charger and headphones left at client meeting to their home in Bastos',             svc: ServiceType.DELIVERY, price: 3000, method: PaymentMethod.MTN_MOMO,     userIdx: 1,  agentIdx: 4,  daysAgo: 27 },
  { desc: 'Collect vehicle technical inspection certificate from DGSN garage',                         svc: ServiceType.ERRAND,   price: 2000, method: PaymentMethod.ORANGE_MONEY, userIdx: 2,  agentIdx: 5,  daysAgo: 27 },
]

// 3 active jobs for live demo feel
const ACTIVE_JOB_SPECS = [
  {
    desc:   'Collect MTN MoMo transfer of 50,000 XAF at Biyem-Assi agency',
    svc:    ServiceType.ERRAND,
    price:  2500,
    method: PaymentMethod.MTN_MOMO,
    status: JobStatus.PENDING,
    userIdx: 3,
    agentIdx: null,
    hoursAgo: 0.1,
  },
  {
    desc:   'Deliver package from DHL Yaoundé to office in Mfandena — fragile',
    svc:    ServiceType.PICKUP,
    price:  4000,
    method: PaymentMethod.ORANGE_MONEY,
    status: JobStatus.EN_ROUTE_TO_PICKUP,
    userIdx: 4,
    agentIdx: 0,
    hoursAgo: 0.5,
  },
  {
    desc:   'Pay AES electricity bill and take photo of receipt',
    svc:    ServiceType.ERRAND,
    price:  1500,
    method: PaymentMethod.CASH,
    status: JobStatus.IN_PROGRESS,
    userIdx: 5,
    agentIdx: 1,
    hoursAgo: 1,
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Drive Me demo seed starting…\n')

  // 1. Agents
  console.log('Creating agents…')
  const agentRecords = []
  for (const a of AGENT_DATA) {
    const agent = await prisma.agent.upsert({
      where:  { phone: a.phone },
      update: { status: a.status },
      create: {
        phone:        a.phone,
        name:         a.name,
        status:       a.status,
        vehicleType:  a.vehicle,
        vehiclePlate: a.plate,
        vehicleMake:  a.make,
        vehicleModel: a.model,
        vehicleYear:  a.year,
        momoPhone:    a.momoPhone,
      },
    })
    agentRecords.push(agent)

    // AgentVerification record
    const isVerified = a.status !== AgentStatus.PENDING_VERIFICATION
    await prisma.agentVerification.upsert({
      where:  { agentId: agent.id },
      update: {},
      create: {
        agentId: agent.id,
        status:  isVerified ? VerificationStatus.APPROVED : VerificationStatus.PENDING,
        method:  isVerified ? VerificationMethod.PHONE_CONFIRMATION : null,
        notes:   isVerified ? 'Identity and vehicle verified by ops team.' : null,
      },
    })

    // AgentEarnings placeholder for verified agents
    if (isVerified) {
      await prisma.agentEarnings.upsert({
        where:  { agentId: agent.id },
        update: {},
        create: {
          agentId:      agent.id,
          totalEarned:  0,
          completedJobs: 0,
          pendingPayout: 0,
        },
      })
    }
  }
  console.log(`  ✓ ${agentRecords.length} agents`)

  // 2. Users
  console.log('Creating users…')
  const userRecords = []
  for (const u of USER_DATA) {
    const user = await prisma.user.upsert({
      where:  { phone: u.phone },
      update: {},
      create: { phone: u.phone, name: u.name },
    })
    userRecords.push(user)
  }
  console.log(`  ✓ ${userRecords.length} users`)

  // 3. Completed jobs
  console.log('Creating completed jobs + payments…')
  let completedCount = 0
  let totalRevenue = 0

  for (const spec of COMPLETED_JOB_SPECS) {
    const user  = userRecords[spec.userIdx]
    const agent = agentRecords[spec.agentIdx]
    const q     = QUARTERS[completedCount % QUARTERS.length]

    const pickup = await prisma.location.create({
      data: {
        lat:     q.lat,
        lng:     q.lng,
        address: `${100 + completedCount} Rue ${q.quarter}`,
        quarter: q.quarter,
      },
    })

    const createdAt = daysAgo(spec.daysAgo)

    const job = await prisma.job.create({
      data: {
        userId:           user.id,
        agentId:          agent.id,
        serviceType:      spec.svc,
        status:           JobStatus.COMPLETED,
        pickupLocationId: pickup.id,
        description:      spec.desc,
        estimatedPrice:   spec.price,
        finalPrice:       spec.price,
        paymentMethod:    spec.method,
        commissionRate:   0.15,
        platformFee:      spec.price * 0.15,
        createdAt,
      },
    })

    await prisma.payment.create({
      data: {
        jobId:  job.id,
        userId: user.id,
        amount: spec.price,
        method: spec.method,
        status: PaymentStatus.PAID,
      },
    })

    const agentNet = spec.price * 0.85
    await prisma.payout.create({
      data: {
        jobId:            job.id,
        agentId:          agent.id,
        amount:           agentNet,
        status:           PayoutStatus.PAID,
        mobileMoneyNumber: agent.momoPhone ?? agent.phone,
      },
    })

    await prisma.agentEarnings.update({
      where: { agentId: agent.id },
      data: {
        totalEarned:   { increment: agentNet },
        completedJobs: { increment: 1 },
      },
    })

    totalRevenue += spec.price
    completedCount++
  }
  console.log(`  ✓ ${completedCount} completed jobs — ${totalRevenue.toLocaleString('fr-FR')} XAF revenue`)

  // 4. Active jobs (live demo feel)
  console.log('Creating active jobs…')
  for (const spec of ACTIVE_JOB_SPECS) {
    const user  = userRecords[spec.userIdx]
    const agent = spec.agentIdx !== null ? agentRecords[spec.agentIdx] : null
    const q     = QUARTERS[0]
    const createdAt = hoursAgo(spec.hoursAgo)

    const pickup = await prisma.location.create({
      data: {
        lat:     q.lat,
        lng:     q.lng,
        address: `Carrefour ${q.quarter}`,
        quarter: q.quarter,
      },
    })

    await prisma.job.create({
      data: {
        userId:           user.id,
        agentId:          agent?.id ?? null,
        serviceType:      spec.svc,
        status:           spec.status,
        pickupLocationId: pickup.id,
        description:      spec.desc,
        estimatedPrice:   spec.price,
        paymentMethod:    spec.method,
        commissionRate:   0.15,
        platformFee:      spec.price * 0.15,
        createdAt,
      },
    })
  }
  console.log(`  ✓ ${ACTIVE_JOB_SPECS.length} active jobs`)

  // Summary
  console.log('\n✅ Demo seed complete.')
  console.log(`   Agents : ${AGENT_DATA.length} (${AGENT_DATA.filter(a => a.status === AgentStatus.PENDING_VERIFICATION).length} pending verification)`)
  console.log(`   Users  : ${USER_DATA.length}`)
  console.log(`   Jobs   : ${completedCount} completed + ${ACTIVE_JOB_SPECS.length} active`)
  console.log(`   Revenue: ${totalRevenue.toLocaleString('fr-FR')} XAF`)
  console.log('\n📊 Dashboard will show:')
  console.log(`   Total agents  → ${AGENT_DATA.length}`)
  console.log(`   Active jobs   → ${ACTIVE_JOB_SPECS.length}`)
  console.log(`   Total users   → ${USER_DATA.length}`)
  console.log(`   Revenue       → ${totalRevenue.toLocaleString('fr-FR')} XAF`)
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
