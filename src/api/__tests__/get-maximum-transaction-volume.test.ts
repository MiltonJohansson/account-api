import { startService, stopService } from '../../application';
import { storeTransaction } from '../../db/db';
import { Server } from '@hapi/hapi';

describe('Get maximum transaction volume', () => {
  let server: Server;
  beforeAll( async() => {
    server = await startService();
  });
  afterAll( async() => {
    await stopService();
  });
  describe('call endpoint', () => {
    const transaction1 = {
      transaction_id: '7943f961-a733-43cf-ba3d-905a5456f6da',
      account_id: '7945f961-a733-43cf-ba3d-905a5456f6da',
      amount: 1234,
    };
    const transaction2 = {
      transaction_id: '7913f961-a733-43cf-ba3d-935a5456f6da',
      account_id: '7945f761-a733-43cf-ba3d-905a5453f6da',
      amount: 1234,
    };
    beforeEach( async() => {
      await storeTransaction('2945f761-a733-43cf-ba3d-905a5453f6da', transaction1.account_id, transaction1.amount);
      await storeTransaction('1945f761-a733-43cf-ba3d-905a5453f6da', transaction1.account_id, transaction1.amount);
      await storeTransaction(transaction1.transaction_id, transaction1.account_id, transaction1.amount);

      await storeTransaction(transaction2.transaction_id, transaction2.account_id, transaction2.amount);
      await storeTransaction('2945f761-a733-43cf-ba3d-905a5453f6da', transaction2.account_id, transaction1.amount);
      await storeTransaction('1945f761-a733-43cf-ba3d-905a5453f6da', transaction2.account_id, transaction1.amount);
    });
    it('should return 200 and correct response', async() => {
      const res = await server.inject({ method: 'GET', url: '/max_transaction_volume'  });
      expect(res.statusCode).toEqual(200);
      expect(res.result).toEqual({ maxVolume: 3, accounts: [transaction1.account_id, transaction2.account_id] });
    });
  });
});
