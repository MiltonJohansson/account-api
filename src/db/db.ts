import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { Database } from 'sqlite/build/Database';

let db: Database;

async function getOrCreateDb(): Promise<Database> {
  if(db) {
    return db;
  }
  try {
    db = await open({
      filename: '/tmp/database.db',
      driver: sqlite3.cached.Database
    });
    await db.exec('DROP TABLE tbl');
    await db.exec('CREATE TABLE tbl (transaction_id TEXT, account_id TEXT, amount NUMBER, balance NUMBER, number_of_transactions NUMBER, created_at NUMBER)');
    return db;
  } catch (error) {
    throw new Error('Failed to create DB');
  }
}

export async function disconnect() {
  if(!db) {
    return;
  }
  await db.close();
}

export interface StoredInterface {
  transaction_id: string;
  account_id: string;
  amount: string;
  balance: number;
  number_of_transactions: number;
}


export async function storeTransaction(transaction_id: string, account_id: string, amount: number): Promise<void> {
  try {
    const query = 'INSERT INTO tbl VALUES (?, ?, ?, ?, ?, ?)';
    const last_transaction = await getLatestTransaction(account_id);
    if (last_transaction && last_transaction.transaction_id === transaction_id) {
      // Transaction is already stored
      return;
    }
    const new_balance = last_transaction ? last_transaction.amount + amount : amount;
    const new_number_of_transactions = last_transaction ? last_transaction.number_of_transactions + 1 : 1;
    const created_at = new Date().getTime();
    await (await getOrCreateDb()).run(query, [transaction_id, account_id, amount, new_balance, new_number_of_transactions, created_at]);
  } catch (error) {
    throw new Error(error);
  }
}
export async function getTransaction(transaction_id: string): Promise<StoredInterface | undefined> {
  try {
    const query = 'SELECT * FROM tbl WHERE transaction_id = ?';
    return await (await getOrCreateDb()).get(query, transaction_id);
  } catch (error) {
    throw new Error(error);
  }
}

export async function getLatestTransaction(account_id: string): Promise<StoredInterface | undefined> {
  try {
    const query = 'SELECT * FROM tbl WHERE account_id = ? ORDER BY created_at DESC LIMIT 1';
    return await (await getOrCreateDb()).get(query, account_id);
  } catch (error) {
    throw new Error(error);
  }
}

export async function getMaximumNumberOfTransactions(): Promise<StoredInterface[]> {
  try {
    const query = 'SELECT * FROM tbl WHERE number_of_transactions = (SELECT MAX(number_of_transactions) FROM tbl)';
    return await (await getOrCreateDb()).all(query);
  } catch (error) {
    throw new Error(error);
  }
}


