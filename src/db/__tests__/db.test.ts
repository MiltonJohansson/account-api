import {
  clearAllRows,
  disconnect,
  getLatestTransaction,
  getMaximumNumberOfTransactions, getOrCreateDb,
  getTransaction,
  storeTransaction
} from '../db';
import { omit } from 'lodash';

describe('Test database', () => {
  beforeEach(async () => {
    await getOrCreateDb();
    await clearAllRows();
  });
  afterAll(async () => {
    await disconnect();
  });
  describe('Test database', () => {
    const account_one = '7945f961-a733-43cf-ba3d-905a5456f6da';
    const account_two = '7945f761-a733-43cf-ba3d-905a5453f6da';
    const transaction_one_account_one = {
      transaction_id: '7943f961-a733-43cf-ba3d-905a5426f6da',
      account_id: account_one,
      amount: 50,
    };
    const transaction_two_account_one = {
      transaction_id: '7933f961-a713-43cf-ba3d-935a5456f3da',
      account_id: account_one,
      amount: 40,
    };

    const transaction_one_account_two = {
      transaction_id: '7943f921-a733-43cf-ba3d-915a5456f6da',
      account_id: account_two,
      amount: 10,
    };
    const transaction_two_account_two = {
      transaction_id: '4913f961-a733-43cf-ba3d-925a5456f6da',
      account_id: account_two,
      amount: 40,
    };
    beforeEach(async () => {
      await storeTransaction(transaction_one_account_one);
    });
    beforeEach(async () => {
      await storeTransaction(transaction_two_account_one);
    });
    beforeEach(async () => {
      await storeTransaction(transaction_one_account_two);
    });
    beforeEach(async () => {
      await storeTransaction(transaction_two_account_two);
    });
    it('should get specific transaction ', async () => {
      const transaction = await getTransaction(transaction_one_account_one.transaction_id);
      expect(omit(transaction, ['balance', 'number_of_transactions', 'created_at'])).toEqual(transaction_one_account_one);
    });
    it('should get latest transaction ', async () => {
      const transaction = await getLatestTransaction(account_one);
      expect(omit(transaction, ['balance', 'number_of_transactions', 'created_at'])).toEqual(transaction_two_account_one);
    });
    it('should get latest transaction with right balance', async () => {
      const transaction = await getLatestTransaction(account_one);
      expect(transaction!.balance).toEqual(
        transaction_two_account_one.amount + transaction_one_account_one.amount);
    });
    it('should get latest transaction with right number_of_transactions', async () => {
      const transaction = await getLatestTransaction(account_one);
      expect(transaction!.number_of_transactions).toEqual(2);
    });
    it('should get maximum number of transactions and which accounts', async () => {
      const transactions = await getMaximumNumberOfTransactions();
      expect(transactions!.map(transaction => omit(transaction, ['balance', 'number_of_transactions', 'created_at'])))
        .toEqual([transaction_two_account_one, transaction_two_account_two]);
    });
  });
});
