import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Database } from 'sqlite/build/Database';
import Boom from 'boom';

let db: Database;

export async function getOrCreateDb(): Promise<Database> {
  if (db) {
    return db;
  }
  try {
    db = await open({
      filename: '/tmp/database.db',
      driver: sqlite3.Database,
    });
    await db.exec(
      'CREATE TABLE IF NOT EXISTS tbl(transaction_id type UNIQUE, account_id TEXT, amount NUMBER, balance NUMBER, number_of_transactions NUMBER, created_at NUMBER)',
    );
    await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS account_index ON tbl (account_id, transaction_id)');
    return db;
  } catch (error) {
    throw new Error('Failed to create DB');
  }
}

export async function disconnect() {
  if (!db) {
    return;
  }
  await db.close();
}

export async function clearAllRows() {
  if (!db) {
    return;
  }
  await db.exec('DELETE FROM tbl');
}

export interface StoredInterface {
  transaction_id: string;
  account_id: string;
  amount: string;
  balance: number;
  number_of_transactions: number;
}

interface TransactionToBeStored {
  transaction_id: string;
  account_id: string;
  amount: number;
}

export async function storeTransaction({ transaction_id, account_id, amount }: TransactionToBeStored): Promise<void> {
  try {
    const query = 'INSERT INTO tbl VALUES (?, ?, ?, ?, ?, ?)';
    const last_transaction = await getLatestTransaction(account_id);
    const new_balance = last_transaction ? last_transaction.amount + amount : amount;
    const new_number_of_transactions = last_transaction ? last_transaction.number_of_transactions + 1 : 1;
    const created_at = new Date().getTime();
    await (await getOrCreateDb()).run(query, [
      transaction_id,
      account_id,
      amount,
      new_balance,
      new_number_of_transactions,
      created_at,
    ]);
  } catch (error) {
    if (error.errno === 19) {
      throw Boom.conflict('Transaction already stored');
    }
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
