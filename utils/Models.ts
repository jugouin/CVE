import { CompteComptable } from './CompteComptable';

export const Libelle = {
  "ECH PRET CAP+IN": CompteComptable._1642050000,
  "FACT SGT": CompteComptable._6270000000,
  "PREL EURO-INFORMATION": CompteComptable._6278000000,
  "PRLV SEPA AESIO": CompteComptable._4372100000,
  "PRLV SEPA ANDERLAINE": CompteComptable._6226200000,
  "PRLV SEPA AST 74": CompteComptable._4372000000,
  "VIR AST 74": CompteComptable._4372000000,
  "PRLV SEPA DGFIP": CompteComptable._4421000,
  "PRLV SEPA FEDERATION FRANCAISE PREL CLUB": CompteComptable._6586200000,
  "PRLV SEPA FREE TELECOM": CompteComptable._6262000000,
  "PRLV SEPA HUMANIS": CompteComptable._4372001000,
  "PRLV SEPA MALAKOFF HUMANIS": CompteComptable._4372001000,
  "PRLV SEPA MMA IARD": CompteComptable._6164000000,
  "PRLV SEPA OVH": CompteComptable._6262000000,
  "PRLV SEPA URSSAF": CompteComptable._4310000000,
  "TPE": CompteComptable._6278000000,
  "VIR SALAIRE": CompteComptable._4210000000,
  "SOUTIEN ASSO SPORTIVE/CULTURELL": CompteComptable._7413000000
}

export interface Transaction {
  date: string;
  dateValeur: string;
  debit: string;
  credit: string;
  libelle: string;
  solde: string;
  compteComptable?: CompteComptable;
}

// Interface pour les transactions classifiées
export interface ClassifiedTransaction extends Transaction {
  compteComptable: CompteComptable;
}