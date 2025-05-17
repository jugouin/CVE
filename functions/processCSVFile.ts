import { processTransactions } from "../index";
import { Transaction } from "../utils/Models";
import { closeReadlineInterface  } from './readLineInterface';

import Papa from 'papaparse';
import * as fs from 'fs';

// Fonction pour traiter un fichier CSV
export async function processCSVFile(filePath: string): Promise<void> {
  const cleanPath = cleanFilePath(filePath);

  try {
    const fileContent = fs.readFileSync(cleanPath, 'utf8');
    
    // Utiliser Papa Parse pour analyser le CSV (avec séparateur point-virgule)
    Papa.parse(fileContent, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: async (results) => {
        await processTransactions(results.data as Transaction[], cleanPath);
        closeReadlineInterface(); // Fermer l'interface readline après avoir traité toutes les transactions
      },
      error: (error) => {
        console.error("Erreur lors de l'analyse du CSV:", error);
        closeReadlineInterface();
      }
    });
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier:", error);
    closeReadlineInterface();
  }
}

// Fonction pour nettoyer le chemin du fichier (enlever les guillemets)
export function cleanFilePath(filePath: string): string {
  // Enlever les guillemets simples ou doubles au début et à la fin
  return filePath.replace(/^['"]|['"]$/g, '');
}