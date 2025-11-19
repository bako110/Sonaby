const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Nettoyer la base de données dans l'ordre des dépendances
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

    // Nettoyer les tables de référence
    await prisma.blacklist_actions.deleteMany();
    await prisma.id_types.deleteMany();
    await prisma.rendezvous_statuses.deleteMany();
    await prisma.user_roles.deleteMany();
    await prisma.visit_statuses.deleteMany();

    // Créer les données de référence
    await prisma.user_roles.createMany({
        data: [
            { role_name: 'ADMIN' },
            { role_name: 'AGENT_GESTION' },
            { role_name: 'AGENT_CONTROLE' },
            { role_name: 'CHEF_SERVICE' }
        ]
    });

    await prisma.id_types.createMany({
        data: [
            { type_name: 'CNI' },
            { type_name: 'PASSEPORT' },
            { type_name: 'PERMIS_CONDUITE' },
            { type_name: 'CARTE_SEJOUR' },
            { type_name: 'AUTRE' }
        ]
    });

    await prisma.rendezvous_statuses.createMany({
        data: [
            { status_name: 'pending' },
            { status_name: 'validated' },
            { status_name: 'cancelled' }
        ]
    });

    await prisma.visit_statuses.createMany({
        data: [
            { status_name: 'active' },
            { status_name: 'finished' },
            { status_name: 'refused' }
        ]
    });

    await prisma.blacklist_actions.createMany({
        data: [
            { action_name: 'added' },
            { action_name: 'removed' }
        ]
    });

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
