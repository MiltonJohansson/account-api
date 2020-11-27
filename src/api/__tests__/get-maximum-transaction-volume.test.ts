import { startService, stopService } from '../../application';
import { clearAllRows, storeTransaction } from '../../db/db';
import { Server } from '@hapi/hapi';

describe('Get maximum transaction volume', () => {
  let server: Server;
  beforeAll(async () => {
    server = await startService();
    await clearAllRows();
  });
  afterAll(async () => {
    await stopService();
  });
  describe('call endpoint', () => {
    const account_one = '7945f961-a733-43cf-ba3d-905a5456f6da';
    const account_two = '7945f761-a733-43cf-ba3d-905a5453f6da';
    const transaction_one_account_one = {
      transaction_id: '7943f961-a733-43cf-ba3d-905a5456f68a',
      account_id: account_one,
      amount: 1234,
    };
    const transaction_two_account_one = {
      transaction_id: '7913f961-a733-43cf-ba3d-915a5456f6da',
      account_id: account_one,
      amount: 1234,
    };
    const transaction_one_account_two = {
      transaction_id: '7943f961-a733-43cf-ba3d-903a5456f6da',
      account_id: account_two,
      amount: 1234,
    };
    const transaction_two_account_two = {
      transaction_id: '7913f961-a733-43cf-ba3d-135a5456f6da',
      account_id: account_two,
      amount: 1234,
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
    it('should return 200 and correct response', async () => {
      const res = await server.inject({ method: 'GET', url: '/max_transaction_volume' });
      expect(res.statusCode).toEqual(200);
      expect(res.result).toEqual({ maxVolume: 2, accounts: [account_one, account_two] });
    });
  });
});
