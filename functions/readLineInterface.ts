import * as readline from 'readline';

// Créer une seule interface readline pour toute l'application
let globalRL: readline.Interface | null = null;

// Fonction pour obtenir l'interface readline
export function getReadlineInterface(): readline.Interface {
  if (!globalRL) {
    globalRL = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  return globalRL;
}

// Fonction pour poser une question et obtenir une réponse
export function question(query: string): Promise<string> {
  const rl = getReadlineInterface();
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Fonction pour fermer l'interface readline à la fin
export function closeReadlineInterface(): void {
  if (globalRL) {
    globalRL.close();
    globalRL = null;
  }
}