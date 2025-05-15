import { CompteComptable } from './CompteComptable';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import * as readline from 'readline';

const category = {
  BANK: [
    CompteComptable._1642050000,
    CompteComptable._6270000000
  ],
  SERVICES: [
    CompteComptable._6278000000,
    CompteComptable._6226200000,
    CompteComptable._4421000,
    CompteComptable._6586200000,
    CompteComptable._6262000000,
    CompteComptable._6164000000,
    CompteComptable._4310000000
  ],
  RH: [
    CompteComptable._4372100000,
    CompteComptable._4372000000,
    CompteComptable._4372001000,
    CompteComptable._4210000000
  ],
  SUBVENTION: [
    CompteComptable._7413000000
  ]
}

interface Transaction {
  date: string;
  dateValeur: string;
  debit: string;
  credit: string;
  libelle: string;
  solde: string;
  compteComptable?: CompteComptable;
}

const model = {
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

// Interface pour les transactions classifiées
interface ClassifiedTransaction extends Transaction {
  compteComptable: CompteComptable;
}

// Fonction pour trouver un compte comptable correspondant selon les modèles
function findMatchingAccount(libelle: string, isCredit: boolean): CompteComptable | undefined {
  for (const [pattern, account] of Object.entries(model)) {
    if (libelle.startsWith(pattern)) {
      // Gestion spéciale de "TPE"
      if (pattern === 'TPE') {
        return isCredit ? CompteComptable._7060000000 : CompteComptable._6278000000;
      }
      return account;
    }
  }
  
  // Analyse plus fine pour certains cas spécifiques
  if (libelle.includes('CARBURANT')) {
    return CompteComptable._6061400000; // Carburants
  } else if (libelle.includes('COTISATION')) {
    return CompteComptable._6281100000; // Cotisations
  } else if (libelle.includes('FRAIS DE DEPLACEMENT')) {
    return CompteComptable._6251000000; // Frais de déplacement
  } else if (libelle.includes('ADHESION')) {
    return CompteComptable._7560000000; // Cotisations adhérents
  } else if (libelle.includes('PASSEPORT')) {
    return CompteComptable._7069200000; // Passeport voile
  } else if (libelle.includes('SUBVENTION')) {
    return CompteComptable._7418800000; // Subventions
  }
  
  return undefined;
}

// Fonction pour afficher les options de comptes comptables et demander à l'utilisateur de choisir
function displayAccountOptions(): void {
  console.log('\nComptes comptables disponibles:');
  const comptesArray = Object.entries(CompteComptable);
  
  comptesArray.forEach(([key, value], index) => {
    console.log(`${index + 1}. ${value} (${key.replace('_', '')})`);
  });
}

// Fonction pour traiter un fichier CSV
async function processCSVFile(filePath: string): Promise<void> {

  const cleanPath = cleanFilePath(filePath);

  try {
    const fileContent = fs.readFileSync(cleanPath, 'utf8');
    
    // Utiliser Papa Parse pour analyser le CSV (avec séparateur point-virgule)
    Papa.parse(fileContent, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: (results) => {
        processTransactions(results.data as Transaction[], cleanPath);
      },
      error: (error) => {
        console.error("Erreur lors de l'analyse du CSV:", error);
      }
    });
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier:", error);
  }
}

// Interface pour stocker les associations libellé -> compte comptable
interface LibelleAccountMapping {
  [key: string]: CompteComptable;
}

// Fonction pour traiter les transactions
async function processTransactions(transactions: Transaction[], filePath: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Stocker les mappings appris pendant cette session
  const learnedMappings: LibelleAccountMapping = {};
  const classifiedTransactions: ClassifiedTransaction[] = [];
  
  console.log(`Nombre total de transactions à classifier: ${transactions.length}`);
  
  // Fonction pour poser une question et obtenir une réponse
  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };
  
  // Traiter chaque transaction séquentiellement
  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    const montant = transaction.debit ? `${transaction.debit}` : transaction.credit;
    
    // Vérifier d'abord si nous avons déjà appris ce libellé exact
    if (learnedMappings[transaction.libelle]) {
      const account = learnedMappings[transaction.libelle];
      classifiedTransactions.push({
        ...transaction,
        compteComptable: account
      });
      console.log(`[${i+1}/${transactions.length}] Transaction "${transaction.libelle}" (${montant}€) automatiquement classifiée comme: ${account}`);
      continue;
    }
    
    // Sinon, essayer de trouver une correspondance selon les modèles
    const suggestedAccount = findMatchingAccount(transaction.libelle, !!transaction.credit);
    
    console.log('\n----------------------------------------------------');
    console.log(`[${i+1}/${transactions.length}] Transaction à classifier:`);
    console.log(`Date: ${transaction.date}`);
    console.log(`Montant: ${montant}€`);
    console.log(`Libellé: ${transaction.libelle}`);

    if (suggestedAccount) {
      classifiedTransactions.push({
        ...transaction,
        compteComptable: suggestedAccount
      });
      learnedMappings[transaction.libelle] = suggestedAccount;
      console.log(`[${i+1}/${transactions.length}] Transaction "${transaction.libelle}" (${montant}€) automatiquement classifiée comme: ${suggestedAccount}`);
      continue; // Passer à la transaction suivante
    }
    else {
      // Aucune suggestion, afficher les options et demander à l'utilisateur de choisir
      displayAccountOptions();
      const selection = await question('Entrez le numéro du compte comptable à utiliser: ');
      const index = parseInt(selection) - 1;
      const comptesArray = Object.values(CompteComptable);
      
      if (index >= 0 && index < comptesArray.length) {
        const selectedAccount = comptesArray[index];
        classifiedTransactions.push({
          ...transaction,
          compteComptable: selectedAccount
        });
        learnedMappings[transaction.libelle] = selectedAccount;
        console.log(`✓ Transaction classifiée comme: ${selectedAccount}`);
      } else {
        console.log('Numéro de compte invalide, veuillez réessayer.');
        i--; // Revenir à cette transaction
      }
    }
  }
  
  rl.close();
  
  // Enregistrer les résultats dans un fichier
  const output = Papa.unparse(classifiedTransactions, {
    delimiter: ';',
    header: true
  });

  const outputPath = path.join(path.dirname(cleanFilePath(filePath)), 'transactions_classifiees.csv');

  fs.writeFileSync(outputPath, output);
  
  console.log(`\nClassification terminée! ${classifiedTransactions.length} transactions classifiées.`);
  console.log(`Résultats enregistrés dans: ${outputPath}`);
  
  // Générer des statistiques
  generateStatistics(classifiedTransactions);
}

// Fonction pour générer des statistiques sur les transactions classifiées
function generateStatistics(transactions: ClassifiedTransaction[]): void {
  console.log('\n=== STATISTIQUES ===');
  
  // Compter les transactions par compte comptable
  const accountCounts: { [key: string]: { count: number, total: number } } = {};

  const parseAmount = (str: string | undefined): number => {
    if (!str) return 0;
    return parseFloat(str.replace(',', '.').replace(/\s/g, '')) || 0;
  };  

  transactions.forEach(transaction => {
    const account = transaction.compteComptable;
    if (!accountCounts[account]) {
      accountCounts[account] = { count: 0, total: 0 };
    }

    const debit = parseAmount(transaction.debit);
    const credit = parseAmount(transaction.credit);
    const amount = credit || -debit;

    accountCounts[account].count++;
    accountCounts[account].total += amount;
  });
  
  console.log('Répartition par compte comptable:');
  Object.entries(accountCounts).forEach(([account, data]) => {
    console.log(`${account}: ${data.count} transactions, total: ${data.total.toFixed(2)}€`);
  });
  
  // Calculer le total des débits et crédits
  let totalDebit = 0;
  let totalCredit = 0;
  
  transactions.forEach(transaction => {
    if (transaction.debit) {
      totalDebit += parseFloat(transaction.debit);
    }
    if (transaction.credit) {
      totalCredit += parseFloat(transaction.credit);
    }
  });
  
  console.log(`\nTotal des débits: ${totalDebit.toFixed(2)}€`);
  console.log(`Total des crédits: ${totalCredit.toFixed(2)}€`);
  console.log(`Solde: ${(totalCredit - totalDebit).toFixed(2)}€`);
}

// Fonction pour nettoyer le chemin du fichier (enlever les guillemets)
function cleanFilePath(filePath: string): string {
  // Enlever les guillemets simples ou doubles au début et à la fin
  return filePath.replace(/^['"]|['"]$/g, '');
}


// Fonction principale
function main(): void {
  // Demander le chemin du fichier à traiter
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Entrez le chemin du fichier CSV à traiter: ', (filePath) => {
    rl.close();
    processCSVFile(filePath);
  });
}

// Exécuter le programme
main();