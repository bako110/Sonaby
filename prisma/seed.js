const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Nettoyer la base de données dans l'ordre des dépendances
    await prisma.refreshToken.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.blacklistHistory.deleteMany();
    await prisma.sosAlert.deleteMany();
    await prisma.visitIncident.deleteMany();
    await prisma.visit.deleteMany();
    await prisma.rendezvous.deleteMany();
    await prisma.groupVisitor.deleteMany();
    await prisma.visitorGroup.deleteMany();
    await prisma.visitor.deleteMany();
    await prisma.agentCheckpointAssignment.deleteMany();
    await prisma.checkpoint.deleteMany();
    await prisma.site.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Créer l'admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            passwordHash: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN'
        }
    });

    // Créer un agent de gestion
    const agent = await prisma.user.create({
        data: {
            email: 'agent@example.com',
            passwordHash: hashedPassword,
            firstName: 'Agent',
            lastName: 'Gestion',
            role: 'AGENT_GESTION'
        }
    });

    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin user:', admin.email);
    console.log('👥 Agent user:', agent.email);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
