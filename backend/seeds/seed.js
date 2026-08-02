"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
require("dotenv/config");
const prisma = new client_1.PrismaClient();
const villes = [
    'Ouagadougou',
    'Bobo-Dioulasso',
    'Koudougou',
    'Ouahigouya',
    'Kaya',
    'Banfora',
    'Dédougou',
    'Fada N\'Gourma',
    'Tenkodogo',
    'Houndé',
];
const usersData = [
    { phone: '+22670000001', name: 'Adama Sawadogo', ville: 'Ouagadougou', quartier: 'Dassasgho' },
    { phone: '+22670111111', name: 'Mariam Kaboré', ville: 'Bobo-Dioulasso', quartier: 'Accart-ville' },
    { phone: '+22670222222', name: 'Issouf Traoré', ville: 'Koudougou', quartier: 'Secteur 5' },
    { phone: '+22670333333', name: 'Fatoumata Ouédraogo', ville: 'Ouahigouya', quartier: 'Secteur 1' },
    { phone: '+22670444444', name: 'Boureima Diallo', ville: 'Banfora', quartier: 'Tatana' },
    { phone: '+22670000099', name: 'Admin Faso', ville: 'Ouagadougou', quartier: 'Ouaga 2000', role: 'ADMIN' },
];
const listingsData = [
    {
        espece: 'POULET',
        race: 'Poulet bicyclette local',
        ageMois: 6,
        poidsKg: 1.5,
        quantite: 20,
        prixFcfa: 3500,
        ville: 'Ouagadougou',
        quartier: 'Tanghin',
        description: 'Poulets locaux bien engraissés, élevés en plein air. Idéal pour cérémonies. Vaccinés.',
        photos: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600', 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600'],
    },
    {
        espece: 'POULET',
        race: 'Pondeuses Isa Brown',
        ageMois: 8,
        poidsKg: 2,
        quantite: 50,
        prixFcfa: 4000,
        ville: 'Bobo-Dioulasso',
        quartier: 'Colma',
        description: 'Pondeuses en pleine production, 1 oeuf/jour. 50 disponibles, lot ou détail.',
        photos: ['https://images.unsplash.com/photo-1598940603846-a1edd0ef2574?w=600'],
    },
    {
        espece: 'PINTADE',
        race: 'Pintade locale',
        ageMois: 7,
        poidsKg: 1.8,
        quantite: 15,
        prixFcfa: 5000,
        ville: 'Koudougou',
        quartier: 'Secteur 9',
        description: 'Pintades de 7 mois, très vitales. Élevage familial.',
        photos: ['https://images.unsplash.com/photo-1551085254-e96b210db58a?w=600'],
    },
    {
        espece: 'BOVIN',
        race: 'Zébu Goudali',
        ageMois: 36,
        poidsKg: 350,
        quantite: 1,
        prixFcfa: 450000,
        ville: 'Ouahigouya',
        quartier: 'Gourga',
        description: 'Taureau Goudali robuste, 3 ans, paré pour Tabaski ou élevage. Carnet vétérinaire à jour.',
        photos: ['https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=600'],
    },
    {
        espece: 'BOVIN',
        race: 'Zébu Peul',
        ageMois: 28,
        poidsKg: 280,
        quantite: 2,
        prixFcfa: 380000,
        ville: 'Dédougou',
        quartier: 'Secteur 2',
        description: '2 vaches laitières Peul, bonnes mères, 8L/jour. Vente pour cause départ.',
        photos: ['https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=600'],
    },
    {
        espece: 'OVIN',
        race: 'Bali-Bali',
        ageMois: 14,
        poidsKg: 45,
        quantite: 3,
        prixFcfa: 85000,
        ville: 'Ouagadougou',
        quartier: 'Pissy',
        description: 'Béliers Bali-Bali pour Tabaski, cornes impressionnantes, engraissés au son de maïs.',
        photos: ['https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600'],
    },
    {
        espece: 'OVIN',
        race: 'Mossi local',
        ageMois: 12,
        poidsKg: 32,
        quantite: 10,
        prixFcfa: 45000,
        ville: 'Kaya',
        quartier: 'Secteur 4',
        description: '10 moutons Mossi, lot complet. Prix négociable si lot.',
        photos: ['https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=600'],
    },
    {
        espece: 'CAPRIN',
        race: 'Chèvre Rousse de Maradi',
        ageMois: 18,
        poidsKg: 28,
        quantite: 5,
        prixFcfa: 35000,
        ville: 'Fada N\'Gourma',
        quartier: 'Secteur 11',
        description: 'Chèvres Maradi, très bonnes laitières et prolifiques. 2 déjà gestantes.',
        photos: ['https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600'],
    },
    {
        espece: 'CAPRIN',
        race: 'Bouc du Sahel',
        ageMois: 20,
        poidsKg: 40,
        quantite: 1,
        prixFcfa: 60000,
        ville: 'Ouahigouya',
        quartier: 'Youba',
        description: 'Grand bouc reproducteur Sahel, 40kg, très viril. Échange possible contre moutons.',
        photos: ['https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600'],
    },
    {
        espece: 'PORCIN',
        race: 'Large White',
        ageMois: 8,
        poidsKg: 85,
        quantite: 6,
        prixFcfa: 70000,
        ville: 'Bobo-Dioulasso',
        quartier: 'Kuini',
        description: 'Porcs Large White charnus, élevés sans hormones, aliment local. Poids moyen 85kg.',
        photos: ['https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600'],
    },
    {
        espece: 'PORCIN',
        race: 'Porc local + Korhogo',
        ageMois: 6,
        poidsKg: 45,
        quantite: 12,
        prixFcfa: 40000,
        ville: 'Banfora',
        quartier: 'Bounouna',
        description: '12 porcelets sevrés croisés Korhogo x local, rustiques, 2 mois.',
        photos: ['https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600'],
    },
    {
        espece: 'LAPIN',
        race: 'Fauve de Bourgogne',
        ageMois: 4,
        poidsKg: 3.5,
        quantite: 25,
        prixFcfa: 8000,
        ville: 'Ouagadougou',
        quartier: 'Wayalghin',
        description: 'Lapins Fauve de Bourgogne, 25 sujets, reproducteurs inclus. Cage offerte pour 10 achetés.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600'],
    },
    {
        espece: 'LAPIN',
        race: 'Lapin local',
        ageMois: 3,
        poidsKg: 2.2,
        quantite: 40,
        prixFcfa: 5000,
        ville: 'Koudougou',
        quartier: 'Nayalgué',
        description: 'Lapins locaux jeunes, chair tendre, idéal pour restaurants.',
        photos: ['https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600'],
    },
    {
        espece: 'POULET',
        race: 'Poulet de chair Cobb 500',
        ageMois: 2,
        poidsKg: 2.5,
        quantite: 100,
        prixFcfa: 3000,
        ville: 'Ouagadougou',
        quartier: 'Zogona',
        description: 'Poulets de chair 45 jours, 2.5kg vif moyen. 100 sujets dispo, abattage sur demande.',
        photos: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600'],
    },
    {
        espece: 'PINTADE',
        race: 'Pintade chaponnée',
        ageMois: 9,
        poidsKg: 2.2,
        quantite: 8,
        prixFcfa: 6500,
        ville: 'Tenkodogo',
        quartier: 'Secteur 3',
        description: 'Pintades chaponnées, chair extra, prêtes pour fêtes de fin d année.',
        photos: ['https://images.unsplash.com/photo-1551085254-e96b210db58a?w=600'],
    },
    {
        espece: 'OVIN',
        race: 'Waré',
        ageMois: 10,
        poidsKg: 38,
        quantite: 4,
        prixFcfa: 65000,
        ville: 'Houndé',
        quartier: 'Centre',
        description: 'Béliers Waré métissés, parfaits pour Tabaski, déjà engraissés.',
        photos: ['https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600'],
    },
    {
        espece: 'BOVIN',
        race: 'Taurin N\'Dama',
        ageMois: 48,
        poidsKg: 320,
        quantite: 1,
        prixFcfa: 400000,
        ville: 'Banfora',
        quartier: 'Lémouroudougou',
        description: 'Boeuf N\'Dama résistant à la trypano, 4 ans, dressé pour labour.',
        photos: ['https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=600'],
    },
    {
        espece: 'CAPRIN',
        race: 'Naine du Sud',
        ageMois: 12,
        poidsKg: 18,
        quantite: 15,
        prixFcfa: 25000,
        ville: 'Dédougou',
        quartier: 'Farakan',
        description: '15 chèvres naines, faciles à élever en ville, peu d espace requis.',
        photos: ['https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600'],
    },
    {
        espece: 'POULET',
        race: 'Bleu d\'Hollande',
        ageMois: 5,
        poidsKg: 1.8,
        quantite: 30,
        prixFcfa: 4500,
        ville: 'Ouagadougou',
        quartier: 'Cissin',
        description: 'Coqs Bleu d\'Hollande purs, plumage superbe, bons coqs pour améliorer race locale.',
        photos: ['https://images.unsplash.com/photo-1598940603846-a1edd0ef2574?w=600'],
    },
    {
        espece: 'PORCIN',
        race: 'Berkshire',
        ageMois: 12,
        poidsKg: 120,
        quantite: 2,
        prixFcfa: 150000,
        ville: 'Bobo-Dioulasso',
        quartier: 'Diaradougou',
        description: 'Truie Berkshire + verrat, couple reproducteur. Déjà donné 2 portées de 9.',
        photos: ['https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600'],
    },
];
async function main() {
    console.log('🌱 Seed Faso Élevage...');
    await prisma.report.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.otp.deleteMany();
    await prisma.user.deleteMany();
    const createdUsers = {};
    for (const u of usersData) {
        const user = await prisma.user.create({ data: u });
        createdUsers[u.phone] = user.id;
        console.log(`User créé: ${u.name} (${u.ville}) - ${u.phone}`);
    }
    const userPhones = usersData.filter(u => u.role !== 'ADMIN').map(u => u.phone);
    for (let i = 0; i < listingsData.length; i++) {
        const data = listingsData[i];
        const randomPhone = userPhones[i % userPhones.length];
        const userId = createdUsers[randomPhone];
        // Randomise statut: 70% approuvée, 20% en attente, 10% vendue
        let statut = 'APPROUVEE';
        const r = Math.random();
        if (r < 0.2)
            statut = 'EN_ATTENTE';
        else if (r < 0.3)
            statut = 'VENDUE';
        await prisma.listing.create({
            data: {
                userId,
                espece: data.espece,
                race: data.race,
                ageMois: data.ageMois,
                poidsKg: data.poidsKg,
                quantite: data.quantite,
                prixFcfa: data.prixFcfa,
                ville: data.ville,
                quartier: data.quartier,
                description: data.description,
                photos: data.photos,
                statut,
                vues: Math.floor(Math.random() * 200),
            },
        });
    }
    console.log(`✅ ${listingsData.length} annonces créées avec succès !`);
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
