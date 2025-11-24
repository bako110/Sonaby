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

    // Créer les statuts de checkpoint (avec upsert pour éviter les doublons)
    const checkpointStatuses = ['active', 'inactive', 'maintenance'];
    for (const status of checkpointStatuses) {
        await prisma.checkpoint_statuses.upsert({
            where: { status_name: status },
            update: {},
            create: { status_name: status }
        });
    }

    // Créer les types de checkpoint
    const checkpointTypes = ['entry', 'exit', 'internal', 'emergency'];
    for (const type of checkpointTypes) {
        await prisma.checkpoint_types.upsert({
            where: { type_name: type },
            update: {},
            create: { type_name: type }
        });
    }

    // Créer les priorités de checkpoint
    const checkpointPriorities = ['low', 'medium', 'high', 'critical'];
    for (const priority of checkpointPriorities) {
        await prisma.checkpoint_priorities.upsert({
            where: { priority_name: priority },
            update: {},
            create: { priority_name: priority }
        });
    }

    // Créer les fréquences de contrôle
    const controlFrequencies = ['hourly', 'daily', 'weekly', 'monthly'];
    for (const frequency of controlFrequencies) {
        await prisma.control_frequencies.upsert({
            where: { frequency_name: frequency },
            update: {},
            create: { frequency_name: frequency }
        });
    }

    // Hasher le mot de passe "password"
    const hashedPassword = await bcrypt.hash('password', 12);

    // Créer tous les utilisateurs par défaut
    const users = await prisma.user.createMany({
        data: [
            {
                id: '6985b877-c56b-11f0-aa39-0242ac140013',
                email: 'admin@example.com',
                passwordHash: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                isActive: true
            },
            {
                id: '6a4febb5-c56b-11f0-aa39-0242ac140013',
                email: 'agent@example.com',
                passwordHash: hashedPassword,
                firstName: 'Agent',
                lastName: 'Gestion',
                role: 'AGENT_GESTION',
                isActive: true
            },
            {
                id: '285a5a9e-c587-11f0-aa39-0242ac140013',
                email: 'agent@service.gmail.com',
                passwordHash: hashedPassword,
                firstName: 'agent',
                lastName: 'service',
                role: 'CHEF_SERVICE',
                isActive: true,
                phone: '2222222'
            },
            {
                id: 'e5c397cd-c586-11f0-aa39-0242ac140013',
                email: 'agent@controller.gmail.com',
                passwordHash: hashedPassword,
                firstName: 'agent',
                lastName: 'controller',
                role: 'AGENT_CONTROLE',
                isActive: true,
                phone: '11111111'
            },
            {
                id: 'a8969b03-c8e6-11f0-aa39-0242ac140013',
                email: 'guigmawpaulin@gmail.com',
                passwordHash: hashedPassword,
                firstName: 'Wendinda Paulin',
                lastName: 'GUIGMA',
                role: 'AGENT_CONTROLE',
                isActive: true,
                phone: '+226 64095771'
            }
        ]
    });

    // Créer des sites d'exemple
    const sites = await prisma.site.createMany({
        data: [
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Site Principal Ouagadougou',
                address: 'Avenue Kwame Nkrumah, Secteur 4',
                city: 'Ouagadougou',
                postalCode: '01 BP 1234',
                country: 'Burkina Faso',
                region: 'Centre',
                activityType: 'HEADQUARTERS',
                status: 'ACTIVE',
                code: 'OUA001',
                phone: '+226 25 30 60 70',
                email: 'contact@ouaga.sonabhy.bf',
                manager: 'Amadou TRAORE',
                managerEmail: 'amadou.traore@sonabhy.bf',
                managerPhone: '+226 70 12 34 56',
                area: 2500.0,
                usableArea: 2000.0,
                employeeCount: 120,
                maxEmployeeCapacity: 150,
                buildingCount: 3,
                wheelchairAccessible: true,
                parkingAvailable: true,
                parkingSpaces: 80,
                securitySystem: true,
                securityGuard: true,
                description: 'Siège social principal de Sonabhy à Ouagadougou',
                coordinates: JSON.stringify({ latitude: 12.3714, longitude: -1.5197 })
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440002',
                name: 'Dépôt Bobo-Dioulasso',
                address: 'Route de Banfora, Zone Industrielle',
                city: 'Bobo-Dioulasso',
                postalCode: '01 BP 567',
                country: 'Burkina Faso',
                region: 'Hauts-Bassins',
                activityType: 'WAREHOUSE',
                status: 'ACTIVE',
                code: 'BOB001',
                phone: '+226 20 97 12 34',
                email: 'depot@bobo.sonabhy.bf',
                manager: 'Fatimata OUEDRAOGO',
                managerEmail: 'fatimata.ouedraogo@sonabhy.bf',
                managerPhone: '+226 76 54 32 10',
                area: 5000.0,
                usableArea: 4500.0,
                employeeCount: 45,
                maxEmployeeCapacity: 60,
                buildingCount: 2,
                wheelchairAccessible: false,
                parkingAvailable: true,
                parkingSpaces: 30,
                securitySystem: true,
                securityGuard: true,
                description: 'Dépôt régional pour la distribution des produits pétroliers',
                coordinates: JSON.stringify({ latitude: 11.1781, longitude: -4.2967 })
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440003',
                name: 'Station Service Koudougou',
                address: 'Avenue de la République',
                city: 'Koudougou',
                postalCode: '01 BP 890',
                country: 'Burkina Faso',
                region: 'Centre-Ouest',
                activityType: 'RETAIL',
                status: 'ACTIVE',
                code: 'KOU001',
                phone: '+226 25 44 12 78',
                email: 'station@koudougou.sonabhy.bf',
                manager: 'Ibrahim SAWADOGO',
                managerEmail: 'ibrahim.sawadogo@sonabhy.bf',
                managerPhone: '+226 78 90 12 34',
                area: 800.0,
                usableArea: 600.0,
                employeeCount: 12,
                maxEmployeeCapacity: 15,
                buildingCount: 1,
                wheelchairAccessible: true,
                parkingAvailable: true,
                parkingSpaces: 20,
                securitySystem: true,
                securityGuard: false,
                description: 'Station-service moderne avec boutique et services',
                coordinates: JSON.stringify({ latitude: 12.2530, longitude: -2.3622 })
            }
        ]
    });

    // Créer des services
    const services = await prisma.service.createMany({
        data: [
            {
                id: '660e8400-e29b-41d4-a716-446655440001',
                name: 'Direction Générale',
                description: 'Direction générale et administration centrale',
                chefId: '285a5a9e-c587-11f0-aa39-0242ac140013', // agent service
                isActive: true
            },
            {
                id: '660e8400-e29b-41d4-a716-446655440002',
                name: 'Ressources Humaines',
                description: 'Gestion du personnel et recrutement',
                chefId: '285a5a9e-c587-11f0-aa39-0242ac140013',
                isActive: true
            },
            {
                id: '660e8400-e29b-41d4-a716-446655440003',
                name: 'Département Technique',
                description: 'Maintenance et support technique',
                chefId: '285a5a9e-c587-11f0-aa39-0242ac140013',
                isActive: true
            },
            {
                id: '660e8400-e29b-41d4-a716-446655440004',
                name: 'Commercial',
                description: 'Ventes et relations clients',
                chefId: '285a5a9e-c587-11f0-aa39-0242ac140013',
                isActive: true
            }
        ]
    });

    // Créer des checkpoints
    const checkpoints = await prisma.checkpoint.createMany({
        data: [
            {
                id: '770e8400-e29b-41d4-a716-446655440001',
                name: 'Entrée Principale Ouaga',
                description: 'Contrôle d\'accès principal du siège',
                siteId: '550e8400-e29b-41d4-a716-446655440001',
                zone: 'Accueil',
                building: 'Bâtiment A',
                floor: 'RDC',
                coordinatesLatitude: 12.3714,
                coordinatesLongitude: -1.5197,
                sosId: 'SOS-OUA-001',
                agentId: 'e5c397cd-c586-11f0-aa39-0242ac140013', // agent controller
                agentName: 'agent controller',
                agentEmail: 'agent@controller.gmail.com',
                agentPhone: '11111111',
                status: 'active',
                checkpointType: 'entry',
                priority: 'high',
                controlFrequency: 'daily',
                active: true,
                createdBy: 'admin@example.com'
            },
            {
                id: '770e8400-e29b-41d4-a716-446655440002',
                name: 'Sortie Parking Ouaga',
                description: 'Contrôle de sortie du parking',
                siteId: '550e8400-e29b-41d4-a716-446655440001',
                zone: 'Parking',
                building: 'Extérieur',
                floor: 'Niveau -1',
                coordinatesLatitude: 12.3710,
                coordinatesLongitude: -1.5200,
                sosId: 'SOS-OUA-002',
                agentId: 'a8969b03-c8e6-11f0-aa39-0242ac140013', // guigmaw
                agentName: 'Wendinda Paulin GUIGMA',
                agentEmail: 'guigmawpaulin@gmail.com',
                agentPhone: '+226 64095771',
                status: 'active',
                checkpointType: 'exit',
                priority: 'medium',
                controlFrequency: 'hourly',
                active: true,
                createdBy: 'admin@example.com'
            },
            {
                id: '770e8400-e29b-41d4-a716-446655440003',
                name: 'Accès Dépôt Bobo',
                description: 'Contrôle d\'accès au dépôt de Bobo-Dioulasso',
                siteId: '550e8400-e29b-41d4-a716-446655440002',
                zone: 'Entrée Dépôt',
                building: 'Hangar Principal',
                floor: 'RDC',
                coordinatesLatitude: 11.1781,
                coordinatesLongitude: -4.2967,
                sosId: 'SOS-BOB-001',
                status: 'active',
                checkpointType: 'entry',
                priority: 'high',
                controlFrequency: 'daily',
                active: true,
                createdBy: 'admin@example.com'
            }
        ]
    });

    // Créer des visiteurs d'exemple
    const visitors = await prisma.visitor.createMany({
        data: [
            {
                id: '880e8400-e29b-41d4-a716-446655440001',
                firstName: 'Marie',
                lastName: 'KABORE',
                phone: '+226 70 11 22 33',
                email: 'marie.kabore@email.com',
                idType: 'CNI',
                idNumber: 'B1234567890',
                company: 'Entreprise KABORE & Fils',
                isBlacklisted: false
            },
            {
                id: '880e8400-e29b-41d4-a716-446655440002',
                firstName: 'Jean',
                lastName: 'OUATTARA',
                phone: '+226 76 44 55 66',
                email: 'j.ouattara@consulting.bf',
                idType: 'PASSEPORT',
                idNumber: 'BF0987654321',
                company: 'Ouattara Consulting',
                isBlacklisted: false
            },
            {
                id: '880e8400-e29b-41d4-a716-446655440003',
                firstName: 'Aminata',
                lastName: 'SANOGO',
                phone: '+226 78 77 88 99',
                email: 'aminata.sanogo@gmail.com',
                idType: 'PERMIS_CONDUITE',
                idNumber: 'PC123456789',
                company: 'Freelance',
                isBlacklisted: false
            }
        ]
    });

    // Créer des rendez-vous d'exemple
    const rendezvous = await prisma.rendezvous.createMany({
        data: [
            {
                id: '990e8400-e29b-41d4-a716-446655440001',
                organizerId: '285a5a9e-c587-11f0-aa39-0242ac140013', // agent service
                visitorId: '880e8400-e29b-41d4-a716-446655440001', // Marie KABORE
                serviceId: '660e8400-e29b-41d4-a716-446655440001', // Direction Générale
                reason: 'Réunion de présentation du nouveau projet d\'expansion',
                visitDate: new Date('2024-12-01'),
                startTime: new Date('2024-12-01T09:00:00Z'),
                endTime: new Date('2024-12-01T11:00:00Z'),
                qrCode: 'QR-RDV-001-2024120109',
                status: 'validated',
                notes: 'Prévoir salle de réunion avec vidéoprojecteur'
            },
            {
                id: '990e8400-e29b-41d4-a716-446655440002',
                organizerId: '6a4febb5-c56b-11f0-aa39-0242ac140013', // agent gestion
                visitorId: '880e8400-e29b-41d4-a716-446655440002', // Jean OUATTARA
                serviceId: '660e8400-e29b-41d4-a716-446655440002', // RH
                reason: 'Entretien pour poste de consultant externe',
                visitDate: new Date('2024-12-02'),
                startTime: new Date('2024-12-02T14:00:00Z'),
                endTime: new Date('2024-12-02T15:30:00Z'),
                qrCode: 'QR-RDV-002-2024120214',
                status: 'pending',
                notes: 'Apporter CV et diplômes'
            },
            {
                id: '990e8400-e29b-41d4-a716-446655440003',
                organizerId: '285a5a9e-c587-11f0-aa39-0242ac140013',
                visitorId: '880e8400-e29b-41d4-a716-446655440003', // Aminata SANOGO
                serviceId: '660e8400-e29b-41d4-a716-446655440003', // Technique
                reason: 'Audit des équipements informatiques',
                visitDate: new Date('2024-12-03'),
                startTime: new Date('2024-12-03T08:00:00Z'),
                endTime: new Date('2024-12-03T17:00:00Z'),
                qrCode: 'QR-RDV-003-2024120308',
                status: 'validated',
                notes: 'Accès nécessaire à tous les locaux techniques'
            }
        ]
    });

    // Créer des visites d'exemple
    const visits = await prisma.visit.createMany({
        data: [
            {
                id: 'aa0e8400-e29b-41d4-a716-446655440001',
                visitorId: '880e8400-e29b-41d4-a716-446655440001', // Marie KABORE
                checkpointId: '770e8400-e29b-41d4-a716-446655440001', // Entrée Principale Ouaga
                serviceId: '660e8400-e29b-41d4-a716-446655440001', // Direction Générale
                reason: 'Réunion direction générale',
                plannedId: '990e8400-e29b-41d4-a716-446655440001', // RDV correspondant
                isGroup: false,
                entryTime: new Date('2024-11-24T08:45:00Z'),
                exitTime: new Date('2024-11-24T11:15:00Z'),
                createdBy: 'e5c397cd-c586-11f0-aa39-0242ac140013', // agent controller
                status: 'finished',
                notes: 'Visite terminée sans incident'
            },
            {
                id: 'aa0e8400-e29b-41d4-a716-446655440002',
                visitorId: '880e8400-e29b-41d4-a716-446655440002', // Jean OUATTARA
                checkpointId: '770e8400-e29b-41d4-a716-446655440001',
                serviceId: '660e8400-e29b-41d4-a716-446655440002', // RH
                reason: 'Entretien d\'embauche',
                isGroup: false,
                entryTime: new Date('2024-11-24T13:30:00Z'),
                createdBy: 'e5c397cd-c586-11f0-aa39-0242ac140013',
                status: 'active',
                notes: 'En cours - Entretien RH'
            }
        ]
    });

    // Créer des incidents d'exemple
    const incidents = await prisma.visitIncident.createMany({
        data: [
            {
                id: 'bb0e8400-e29b-41d4-a716-446655440001',
                visitId: 'aa0e8400-e29b-41d4-a716-446655440001',
                reportedBy: 'e5c397cd-c586-11f0-aa39-0242ac140013', // agent controller
                title: 'Badge visiteur défaillant',
                description: 'Le badge temporaire du visiteur ne fonctionnait pas sur les lecteurs du 2ème étage',
                severityLevel: 1, // Low
                isResolved: true,
                resolvedAt: new Date('2024-11-24T10:30:00Z'),
                resolutionNotes: 'Badge remplacé, problème résolu'
            },
            {
                id: 'bb0e8400-e29b-41d4-a716-446655440002',
                visitId: 'aa0e8400-e29b-41d4-a716-446655440002',
                reportedBy: 'a8969b03-c8e6-11f0-aa39-0242ac140013', // guigmaw
                title: 'Visiteur sans pièce d\'identité',
                description: 'Le visiteur a oublié sa pièce d\'identité, vérification par téléphone effectuée',
                severityLevel: 2, // Medium
                isResolved: true,
                resolvedAt: new Date('2024-11-24T14:00:00Z'),
                resolutionNotes: 'Identité confirmée par appel téléphonique au responsable RH'
            }
        ]
    });

    // Créer des alertes SOS d'exemple
    const sosAlerts = await prisma.sosAlert.createMany({
        data: [
            {
                id: 'cc0e8400-e29b-41d4-a716-446655440001',
                checkpointId: '770e8400-e29b-41d4-a716-446655440002', // Sortie Parking
                triggeredBy: 'a8969b03-c8e6-11f0-aa39-0242ac140013', // guigmaw
                triggeredAt: new Date('2024-11-23T16:45:00Z'),
                message: 'Tentative d\'effraction véhicule dans le parking',
                isResolved: true,
                resolvedAt: new Date('2024-11-23T17:15:00Z'),
                resolvedBy: '6985b877-c56b-11f0-aa39-0242ac140013', // admin
                resolutionNotes: 'Fausse alerte - Propriétaire qui avait perdu ses clés'
            }
        ]
    });

    // Créer des entrées d'audit
    const auditLogs = await prisma.auditLog.createMany({
        data: [
            {
                id: 'dd0e8400-e29b-41d4-a716-446655440001',
                userId: '6985b877-c56b-11f0-aa39-0242ac140013', // admin
                action: 'CREATE',
                entity: 'Site',
                entityId: '550e8400-e29b-41d4-a716-446655440001',
                oldValues: null,
                newValues: JSON.stringify({ name: 'Site Principal Ouagadougou', status: 'ACTIVE' }),
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 'dd0e8400-e29b-41d4-a716-446655440002',
                userId: 'e5c397cd-c586-11f0-aa39-0242ac140013', // agent controller
                action: 'CREATE',
                entity: 'Visit',
                entityId: 'aa0e8400-e29b-41d4-a716-446655440001',
                oldValues: null,
                newValues: JSON.stringify({ visitorName: 'Marie KABORE', status: 'active' }),
                ipAddress: '192.168.1.101',
                userAgent: 'Mozilla/5.0 (Android 10; Mobile; rv:81.0) Gecko/81.0 Firefox/81.0'
            }
        ]
    });

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('📊 DONNÉES CRÉÉES:');
    console.log('👤 5 utilisateurs avec mot de passe: "password"');
    console.log('🏢 3 sites (Ouagadougou, Bobo-Dioulasso, Koudougou)');
    console.log('🏛️ 4 services (Direction, RH, Technique, Commercial)');
    console.log('📍 3 checkpoints avec affectations d\'agents');
    console.log('👥 3 visiteurs d\'exemple');
    console.log('📅 3 rendez-vous planifiés');
    console.log('🚪 2 visites enregistrées');
    console.log('⚠️ 2 incidents déclarés');
    console.log('🆘 1 alerte SOS résolue');
    console.log('📋 2 entrées d\'audit');
    console.log('');
    console.log('🔑 COMPTES UTILISATEURS:');
    console.log('   - admin@example.com (ADMIN)');
    console.log('   - agent@example.com (AGENT_GESTION)');
    console.log('   - agent@service.gmail.com (CHEF_SERVICE)');
    console.log('   - agent@controller.gmail.com (AGENT_CONTROLE)');
    console.log('   - guigmawpaulin@gmail.com (AGENT_CONTROLE)');
    console.log('');
    console.log('🏢 SITES CRÉÉS:');
    console.log('   - Site Principal Ouagadougou (OUA001) - HEADQUARTERS');
    console.log('   - Dépôt Bobo-Dioulasso (BOB001) - WAREHOUSE');
    console.log('   - Station Service Koudougou (KOU001) - RETAIL');
    console.log('');
    console.log('🎯 PRÊT POUR LES TESTS API!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
