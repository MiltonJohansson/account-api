import { Server } from '@hapi/hapi';
import { omit } from 'lodash';
import { startService, stopService } from '../../application';
import { storeTransaction } from '../../db/db';

describe('Get transaction', () => {
  let server: Server;
  beforeAll(async () => {
    server = await startService();
  });
  afterAll(async () => {
    await stopService();
  });
  describe('call endpoint', () => {
    describe('with correct params', () => {
      describe('with stored transaction', () => {
        const transaction = {
          transaction_id: '7943f961-a733-43cf-ba3d-905a5456f6da',
          account_id: '7945f961-a733-43cf-ba3d-905a5456f6da',
          amount: 1234,
        };
        beforeEach( async() => {
          await storeTransaction(transaction.transaction_id, transaction.account_id, transaction.amount);
        });
        it('should return 200', async () => {
          const res = await server.inject({method: 'GET', url: `/transaction/${transaction.transaction_id}`});
          expect(res.statusCode).toEqual(200);
        });
        it('should return transaction', async () => {
          const res = await server.inject({method: 'GET', url: `/transaction/${transaction.transaction_id}`});
          expect(res.result).toEqual(omit(transaction, ['transaction_id']));
        });
      });
    });
    describe('with incorrect params', () => {
      it('should return 400', async () => {
        const res = await server.inject({method: 'GET', url: `/transaction/${123}`});
        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
