import { LibelleAccountMapping } from './utils/CompteComptable';
import { Transaction, ClassifiedTransaction } from './utils/Models';
import { processCSVFile, cleanFilePath } from './functions/processCSVFile';
import { findMatchingAccount } from './functions/matching';
import { question  } from './functions/readLineInterface';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import { generateStatistics } from './functions/statistics';
import { displayAccountOptions } from './functions/display';
import chalk from 'chalk';

// Fonction pour traiter les transactions
export async function processTransactions(transactions: Transaction[], filePath: string): Promise<void> {
  // Stocker les mappings appris pendant cette session
  const learnedMappings: LibelleAccountMapping = {};
  const classifiedTransactions: ClassifiedTransaction[] = [];
  
  console.log(`Nombre total de transactions à classifier: ${transactions.length}`);
  
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
      console.log(chalk.green(`[${i+1}/${transactions.length}] Transaction "${transaction.libelle}" (${montant}€) automatiquement classifiée comme: ${account}`));
      continue;
    }
    
    // Sinon, essayer de trouver une correspondance selon les modèles
    const suggestedAccount = findMatchingAccount(transaction.libelle, !!transaction.credit);
    
    console.log(chalk.gray('\n----------------------------------------------------'));
    console.log(chalk.cyan(`[${i + 1}/${transactions.length}] Transaction à classifier:`));
    console.log(chalk.bold(`Date: `) + chalk.white(transaction.date));
    console.log(chalk.bold(`Montant: `) + chalk.white(`${montant}€`));
    console.log(chalk.bold(`Libellé: `) + chalk.yellow(transaction.libelle));

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
      // Aucune suggestion, utiliser displayAccountOptions pour permettre à l'utilisateur de choisir
      console.log('Aucune suggestion automatique disponible.');
      const selectedAccount = await displayAccountOptions();
      
      if (selectedAccount) {
        classifiedTransactions.push({
          ...transaction,
          compteComptable: selectedAccount
        });
        learnedMappings[transaction.libelle] = selectedAccount;
        console.log(chalk.bgGreen.white(`✓ Transaction classifiée comme: ${selectedAccount}`));
      } else {
        console.log('Sélection de compte invalide, veuillez réessayer.');
        i--; // Revenir à cette transaction
      }
    }
  }
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

// Fonction principale
async function main(): Promise<void> {
  // Demander le chemin du fichier à traiter
  const filePath = await question('Entrez le chemin du fichier CSV à traiter: ');
  await processCSVFile(filePath);
}

// Exécuter le programme
main();