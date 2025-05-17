import { Categories } from "../utils/Categories";
import { CompteComptable } from "../utils/CompteComptable";
import { question } from "./readLineInterface";
import chalk from 'chalk';

// Fonction pour afficher les options de comptes comptables et demander à l'utilisateur de choisir
export async function displayAccountOptions(): Promise<CompteComptable | undefined> {
  try {
    // 1. Afficher les catégories disponibles
    console.log(chalk.bold.cyan('\nCatégories disponibles:'));
    const categoriesArray = Object.keys(Categories);
    categoriesArray.forEach((category, index) => {
      console.log(chalk.magenta(`${index + 1}. ${category}`));
    });

    // 2. Demander à l'utilisateur de choisir une catégorie
    const categorySelection = await question(chalk.yellow('Sélectionnez une catégorie (numéro): '));
    const categoryIndex = parseInt(categorySelection) - 1;

    if (categoryIndex < 0 || categoryIndex >= categoriesArray.length) {
      console.log(chalk.red('Numéro de catégorie invalide.'));
      return undefined;
    }

    const selectedCategory = categoriesArray[categoryIndex];
    const categoryAccounts = Categories[selectedCategory];

    // 3. Afficher les comptes de la catégorie sélectionnée
    console.log(chalk.bold.cyan(`\nComptes comptables dans la catégorie ${chalk.underline(selectedCategory)}:`));
    categoryAccounts.forEach((account, index) => {
      const accountKey = Object.entries(CompteComptable)
        .find(([_, val]) => val === account)?.[0] || '';
      
      console.log(chalk.green(`${index + 1}. ${account} (${accountKey.replace('_', '')})`));
    });

    // 4. Demander à l'utilisateur de choisir un compte
    const accountSelection = await question(chalk.yellow('Sélectionnez un compte comptable (numéro): '));
    const accountIndex = parseInt(accountSelection) - 1;

    if (accountIndex < 0 || accountIndex >= categoryAccounts.length) {
      console.log(chalk.red('Numéro de compte invalide.'));
      return undefined;
    }

    const selectedAccount = categoryAccounts[accountIndex];
    return selectedAccount;
  } catch (error) {
    console.error(chalk.bgRed.white("Erreur lors de la sélection du compte:"), error);
    return undefined;
  }
}
