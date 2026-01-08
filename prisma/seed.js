const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creating enum tables...');

    // Créer les tables d'énumération
    console.log('📝 Creating user roles...');
    const userRoles = [
        { role_name: 'ADMIN' },
        { role_name: 'AGENT_GESTION' },
        { role_name: 'AGENT_CONTROLE' },
        { role_name: 'CHEF_SERVICE' }
    ];

    for (const role of userRoles) {
        await prisma.user_roles.upsert({
            where: { role_name: role.role_name },
            update: {},
            create: role
        });
    }

    console.log('🆔 Creating ID types...');
    const idTypes = [
        { type_name: 'CNI' },
        { type_name: 'PASSEPORT' },
        { type_name: 'PERMIS_CONDUITE' }
    ];

    for (const type of idTypes) {
        await prisma.id_types.upsert({
            where: { type_name: type.type_name },
            update: {},
            create: type
        });
    }

    console.log('📅 Creating rendezvous statuses...');
    const rendezvousStatuses = [
        { status_name: 'pending' },
        { status_name: 'validated' },
        { status_name: 'cancelled' }
    ];

    for (const status of rendezvousStatuses) {
        await prisma.rendezvous_statuses.upsert({
            where: { status_name: status.status_name },
            update: {},
            create: status
        });
    }

    console.log('🚪 Creating visit statuses...');
    const visitStatuses = [
        { status_name: 'active' },
        { status_name: 'finished' },
        { status_name: 'refused' }
    ];

    for (const status of visitStatuses) {
        await prisma.visit_statuses.upsert({
            where: { status_name: status.status_name },
            update: {},
            create: status
        });
    }

    console.log('🔒 Creating blacklist actions...');
    const blacklistActions = [
        { action_name: 'BLACKLIST' },
        { action_name: 'UNBLACKLIST' }
    ];

    for (const action of blacklistActions) {
        await prisma.blacklist_actions.upsert({
            where: { action_name: action.action_name },
            update: {},
            create: action
        });
    }

    console.log('📍 Creating checkpoint statuses...');
    const checkpointStatuses = [
        { status_name: 'active' },
        { status_name: 'inactive' },
        { status_name: 'maintenance' }
    ];

    for (const status of checkpointStatuses) {
        await prisma.checkpoint_statuses.upsert({
            where: { status_name: status.status_name },
            update: {},
            create: status
        });
    }

    console.log('🏗️ Creating checkpoint types...');
    const checkpointTypes = [
        { type_name: 'entry' },
        { type_name: 'exit' },
        { type_name: 'internal' },
        { type_name: 'external' },
        { type_name: 'emergency' },
        { type_name: 'patrol' }
    ];

    for (const type of checkpointTypes) {
        await prisma.checkpoint_types.upsert({
            where: { type_name: type.type_name },
            update: {},
            create: type
        });
    }

    console.log('⚡ Creating checkpoint priorities...');
    const checkpointPriorities = [
        { priority_name: 'low' },
        { priority_name: 'medium' },
        { priority_name: 'high' },
        { priority_name: 'critical' }
    ];

    for (const priority of checkpointPriorities) {
        await prisma.checkpoint_priorities.upsert({
            where: { priority_name: priority.priority_name },
            update: {},
            create: priority
        });
    }

    console.log('⏰ Creating control frequencies...');
    const controlFrequencies = [
        { frequency_name: 'hourly' },
        { frequency_name: 'daily' },
        { frequency_name: 'weekly' },
        { frequency_name: 'monthly' }
    ];

    for (const frequency of controlFrequencies) {
        await prisma.control_frequencies.upsert({
            where: { frequency_name: frequency.frequency_name },
            update: {},
            create: frequency
        });
    }

    console.log('🏢 Creating activity types...');
    const activityTypes = [
        { type_name: 'OFFICE' },
        { type_name: 'PRODUCTION' },
        { type_name: 'WAREHOUSE' },
        { type_name: 'RETAIL' },
        { type_name: 'RESEARCH' },
        { type_name: 'DATACENTER' },
        { type_name: 'LOGISTICS' },
        { type_name: 'MANUFACTURING' },
        { type_name: 'HEADQUARTERS' },
        { type_name: 'OTHER' }
    ];

    for (const type of activityTypes) {
        await prisma.activity_types.upsert({
            where: { type_name: type.type_name },
            update: {},
            create: type
        });
    }

    console.log('🏭 Creating site statuses...');
    const siteStatuses = [
        { status_name: 'ACTIVE' },
        { status_name: 'INACTIVE' },
        { status_name: 'UNDER_CONSTRUCTION' },
        { status_name: 'MAINTENANCE' },
        { status_name: 'CLOSED' },
        { status_name: 'PLANNED' },
        { status_name: 'SUSPENDED' }
    ];

    for (const status of siteStatuses) {
        await prisma.site_statuses.upsert({
            where: { status_name: status.status_name },
            update: {},
            create: status
        });
    }

    console.log('✅ All enum tables created successfully!');
    console.log('🌱 Creating default users...');

    const hashedPassword = await bcrypt.hash('password', 12);

    const users = [
        {
            id: '6985b877-c56b-11f0-aa39-0242ac140013',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            isActive: true
        }
    ];

    // Création avec UPSERT pour éviter les doublons
    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                ...user,
                passwordHash: hashedPassword
            }
        });
    }

    console.log('✅ Users created successfully!');
    console.log(' Mot de passe par défaut : "password"');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
