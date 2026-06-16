export const LEGAL_AREA_IDS = [
  'laboral',
  'civil',
  'penal',
  'familia',
  'fiscal',
  'trafico',
  'consumidor',
  'mercantil',
  'extranjeria',
] as const;

export type LegalAreaId = (typeof LEGAL_AREA_IDS)[number];

export interface LegalAreaDefinition {
  id: LegalAreaId;
  label: string;
  description: string;
  agentName: string;
  legislation: string[];
  strictDisclaimer: boolean;
}

export const LEGAL_AREAS: readonly LegalAreaDefinition[] = [
  {
    id: 'laboral',
    label: 'Employment Law',
    description: 'Dismissals, contracts, harassment, overtime, and workplace disputes',
    agentName: 'Dr. Elena Vargas',
    legislation: ['Estatuto de los Trabajadores', 'LRJS', 'EBEP'],
    strictDisclaimer: false,
  },
  {
    id: 'civil',
    label: 'Civil & Contracts',
    description: 'Contracts, civil liability, leases, and claims',
    agentName: 'Dr. Miguel Ortega',
    legislation: ['Código Civil', 'LEC'],
    strictDisclaimer: false,
  },
  {
    id: 'penal',
    label: 'Criminal Law',
    description: 'Complaints, defense, offenses, and criminal procedure',
    agentName: 'Dr. Javier Morales',
    legislation: ['Código Penal', 'LECrim'],
    strictDisclaimer: true,
  },
  {
    id: 'familia',
    label: 'Family Law',
    description: 'Divorce, custody, alimony, and family mediation',
    agentName: 'Dr. Laura Sánchez',
    legislation: ['Código Civil Libro I', 'Ley de Jurisdicción Voluntaria'],
    strictDisclaimer: false,
  },
  {
    id: 'fiscal',
    label: 'Tax Law',
    description: 'Income tax, VAT, inspections, penalties, and tax planning',
    agentName: 'Dr. Andrés Ruiz',
    legislation: ['LIRPF', 'LIVA', 'LGT', 'RGPD'],
    strictDisclaimer: true,
  },
  {
    id: 'trafico',
    label: 'Traffic Law',
    description: 'Fines, points, accidents, and administrative appeals',
    agentName: 'Dr. Carmen Díaz',
    legislation: ['Ley de Seguridad Vial', 'RGC'],
    strictDisclaimer: false,
  },
  {
    id: 'consumidor',
    label: 'Consumer Law',
    description: 'Claims, warranties, unfair terms, and ODR',
    agentName: 'Dr. Pablo Navarro',
    legislation: ['LGDCU', 'LCGC', 'ODR'],
    strictDisclaimer: false,
  },
  {
    id: 'mercantil',
    label: 'Commercial Law',
    description: 'Companies, insolvency, commercial contracts, and compliance',
    agentName: 'Dr. Isabel Torres',
    legislation: ['LSC', 'Código de Comercio', 'Ley Concursal'],
    strictDisclaimer: false,
  },
  {
    id: 'extranjeria',
    label: 'Immigration Law',
    description: 'Residence, nationality, visas, and administrative appeals',
    agentName: 'Dr. Roberto Gil',
    legislation: ['LOEx', 'Reglamento de Extranjería'],
    strictDisclaimer: false,
  },
] as const;

export function getLegalAreaById(id: LegalAreaId): LegalAreaDefinition | undefined {
  return LEGAL_AREAS.find((area) => area.id === id);
}