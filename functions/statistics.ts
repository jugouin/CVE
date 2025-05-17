import { ClassifiedTransaction } from "../utils/Models";

// Fonction pour générer des statistiques sur les transactions classifiées
export function generateStatistics(transactions: ClassifiedTransaction[]): void {
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
      totalDebit += parseAmount(transaction.debit);
    }
    if (transaction.credit) {
      totalCredit += parseAmount(transaction.credit);
    }
  });
  
  console.log(`\nTotal des débits: ${totalDebit.toFixed(2)}€`);
  console.log(`Total des crédits: ${totalCredit.toFixed(2)}€`);
  console.log(`Solde: ${(totalCredit - totalDebit).toFixed(2)}€`);
}