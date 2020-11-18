import { startService, stopService } from '../../application';
import { storeTransaction } from '../../db/db';
import { Server } from "@hapi/hapi";

describe('Get balance', () => {
  let server: Server;
  beforeAll(async () => {
    server = await startService();
  });
  afterAll(async () => {
    await stopService();
  });
  describe('call endpoint', () => {
    describe('with correct params', () => {
      const transaction = {
        transaction_id: '7943f961-a733-43cf-ba3d-905a5856f6da',
        account_id: 'a40bcc03-6f39-418c-ad0b-97e14f522ec1',
        amount: 7,
      };
      describe('with two identical transactions and one deducting', () => {
        beforeEach(async () => {
          await storeTransaction(transaction.transaction_id, transaction.account_id, transaction.amount);
          await storeTransaction(transaction.transaction_id, transaction.account_id, transaction.amount);
          await storeTransaction('1943f961-a733-43cf-ba3d-905a5856f6da', transaction.account_id, -2);
        });
        it('should return 200 and balance deducted from first transaction', async () => {
          const first_result = await server.inject({method: 'GET', url: `/balance/${transaction.account_id}`});
          expect(first_result.statusCode).toEqual(200);
          expect(first_result.result).toEqual({balance: 5});
        });
      });
    });
    describe('with incorrect params', () => {
      it('should return 400', async () => {
        const res = await server.inject({method: 'GET', url: `/balance/${123}`});
        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
