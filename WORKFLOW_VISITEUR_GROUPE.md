/**
 * WORKFLOW COMPLET : Visiteur Seul vs Groupe de Visiteurs
 * 
 * ========================================
 * SCENARIO 1 : VISITEUR SEUL
 * ========================================
 * 
 * 1. Créer un visiteur avec POST /api/v1/visitors
 *    Request Body:
 *    {
 *      "firstName": "Jean",
 *      "lastName": "Dupont",
 *      "idType": "CIN",
 *      "idNumber": "ABC123456",
 *      "phone": "0612345678",
 *      "email": "jean@example.com",
 *      "company": "Acme Corp"
 *    }
 *    
 *    Response:
 *    {
 *      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
 *      "firstName": "Jean",
 *      "lastName": "Dupont",
 *      ... autres champs
 *    }
 * 
 * 2. Créer la visite avec POST /api/v1/visits
 *    Request Body:
 *    {
 *      "visitorId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",  // ID du visiteur créé
 *      "checkpointId": "yyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
 *      "reason": "Visite de contrôle",
 *      "entityVisited": "Bureau 101",
 *      "contactPerson": "Marie Martin",
 *      "origin": "Siège social"
 *    }
 * 
 * 
 * ========================================
 * SCENARIO 2 : GROUPE DE VISITEURS
 * ========================================
 * 
 * 1. Créer le visiteur responsable (celui qui doit enregistrer)
 *    POST /api/v1/visitors
 *    Request Body:
 *    {
 *      "firstName": "Alice",
 *      "lastName": "Martin",
 *      "idType": "CIN",
 *      "idNumber": "XYZ789012",
 *      "phone": "0687654321",
 *      "email": "alice@example.com",
 *      "company": "BigCorp"
 *    }
 *    
 *    Response:
 *    {
 *      "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
 *      ...
 *    }
 * 
 * 2. Créer le groupe avec les autres visiteurs
 *    POST /api/v1/visitor-groups
 *    Request Body:
 *    {
 *      "visitorId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",  // ID du responsable
 *      "otherVisitors": [
 *        {
 *          "firstName": "Bob",
 *          "lastName": "Johnson"
 *        },
 *        {
 *          "firstName": "Charlie",
 *          "lastName": "Wilson"
 *        }
 *      ]
 *    }
 *    
 *    Response:
 *    {
 *      "id": "gggggggg-gggg-gggg-gggg-gggggggggggg",  // ID du groupe
 *      "groupCode": "GRP_1703770000000",
 *      "responsibleVisitor": {
 *        "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
 *        "firstName": "Alice",
 *        "lastName": "Martin"
 *      },
 *      "visitors": [
 *        { "visitor": { "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", ... } },
 *        { "visitor": { "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", ... } },  // Bob créé auto
 *        { "visitor": { "id": "cccccccc-cccc-cccc-cccc-cccccccccccc", ... } }   // Charlie créé auto
 *      ]
 *    }
 * 
 * 3. Créer la visite du groupe
 *    POST /api/v1/visits
 *    Request Body:
 *    {
 *      "visitorGroupId": "gggggggg-gggg-gggg-gggg-gggggggggggg",  // ID du groupe
 *      "checkpointId": "yyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
 *      "reason": "Visite d'équipe d'inspection"
 *    }
 *    
 *    Response:
 *    {
 *      "id": "vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv",
 *      "visitorGroupId": "gggggggg-gggg-gggg-gggg-gggggggggggg",
 *      "visitorGroup": {
 *        "id": "gggggggg-gggg-gggg-gggg-gggggggggggg",
 *        "groupCode": "GRP_1703770000000",
 *        "responsibleVisitor": { ... },
 *        "visitors": [ ... ]  // Tous les visiteurs du groupe
 *      }
 *    }
 * 
 * 
 * ========================================
 * NOTES IMPORTANTES
 * ========================================
 * 
 * - Pour un visiteur seul : utiliser visitorId dans la création de visite
 * - Pour un groupe : d'abord créer le groupe, puis utiliser visitorGroupId pour la visite
 * - Les visiteurs supplémentaires du groupe sont créés automatiquement (juste nom/prénom)
 * - Le responsable du groupe doit être créé AVANT la création du groupe
 * - Les champs groupCode, organizerId, serviceId, etc sont générés automatiquement
 * 
 */
