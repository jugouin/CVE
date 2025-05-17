import { CompteComptable } from "../utils/CompteComptable";
import { Libelle } from "../utils/Models";

export function findMatchingAccount(libelle: string, isCredit: boolean): CompteComptable | undefined {
  for (const [pattern, account] of Object.entries(Libelle)) {
    if (libelle.startsWith(pattern)) {
      // Gestion spéciale de "TPE"
      if (pattern === 'TPE') {
        return isCredit ? CompteComptable._TPE_CLUB : CompteComptable._6278000000;
      }
      return account;
    }
  }
  
  // // Analyse plus fine pour certains cas spécifiques
  // if (libelle.includes('CARBURANT')) {
  //   return CompteComptable._6061400000; // Carburants
  // } else if (libelle.includes('COTISATION')) {
  //   return CompteComptable._6281100000; // Cotisations
  // } else if (libelle.includes('FRAIS DE DEPLACEMENT')) {
  //   return CompteComptable._6251000000; // Frais de déplacement
  // } else if (libelle.includes('ADHESION')) {
  //   return CompteComptable._7560000000; // Cotisations adhérents
  // } else if (libelle.includes('PASSEPORT')) {
  //   return CompteComptable._7069200000; // Passeport voile
  // } else if (libelle.includes('SUBVENTION')) {
  //   return CompteComptable._7418800000; // Subventions
  // }
  
  return undefined;
}
