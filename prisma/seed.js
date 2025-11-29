const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
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
        },
        {
            id: '6a4febb5-c56b-11f0-aa39-0242ac140013',
            email: 'agent@example.com',
            firstName: 'Agent',
            lastName: 'Gestion',
            role: 'AGENT_GESTION',
            isActive: true
        },
        {
            id: '285a5a9e-c587-11f0-aa39-0242ac140013',
            email: 'agent@service.gmail.com',
            firstName: 'agent',
            lastName: 'service',
            role: 'CHEF_SERVICE',
            isActive: true,
            phone: '2222222'
        },
        {
            id: 'e5c397cd-c586-11f0-aa39-0242ac140013',
            email: 'agent@controller.gmail.com',
            firstName: 'agent',
            lastName: 'controller',
            role: 'AGENT_CONTROLE',
            isActive: true,
            phone: '11111111'
        },
        {
            id: 'a8969b03-c8e6-11f0-aa39-0242ac140013',
            email: 'guigmawpaulin@gmail.com',
            firstName: 'Wendinda Paulin',
            lastName: 'GUIGMA',
            role: 'AGENT_CONTROLE',
            isActive: true,
            phone: '+226 64095771'
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
    console.log('🔑 Mot de passe par défaut : "password"');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
