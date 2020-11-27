import { omit } from 'lodash';
import { startService, stopService } from '../../application';
import { clearAllRows, getTransaction } from '../../db/db';
import { Server } from '@hapi/hapi';

describe('Post amount', () => {
  let server: Server;
  beforeAll(async () => {
    server = await startService();
    await clearAllRows();
  });
  afterAll(async () => {
    await stopService();
  });
  describe('call endpoint', () => {
    describe('with correct header', () => {
      const correct_headers = {
        'Transaction-Id': '7941f961-a733-43cf-ba3d-905a5856f6da',
      };
      describe('with correct payload', () => {
        const correct_payload = { account_id: '7943f961-a733-43cf-ba3d-905a5456f6da', amount: 123 };
        it('should return 200', async () => {
          const res = await server.inject({
            method: 'POST',
            url: '/amount',
            headers: correct_headers,
            payload: correct_payload,
          });
          expect(res.statusCode).toEqual(200);
          expect(res.result).toEqual({});
        });
        it('should have stored transaction', async () => {
          await server.inject({ method: 'POST', url: '/amount', headers: correct_headers, payload: correct_payload });
          const transaction = await getTransaction(correct_headers['Transaction-Id']);
          expect(omit(transaction, 'created_at')).toEqual({
            account_id: correct_payload.account_id,
            amount: correct_payload.amount,
            transaction_id: correct_headers['Transaction-Id'],
            balance: correct_payload.amount,
            number_of_transactions: 1,
          });
        });
      });
      describe('with incorrect payload', () => {
        const correct_payload = { account_id: 123, amount: '123' };
        it('should return 400', async () => {
          const res = await server.inject({
            method: 'POST',
            url: '/amount',
            headers: correct_headers,
            payload: correct_payload,
          });
          expect(res.statusCode).toEqual(400);
        });
      });
    });
    describe('with incorrect header', () => {
      const incorrect_headers = {
        transaction_id: ['12345'],
      };
      const correct_payload = { account_id: '7943f961-a733-43cf-ba3d-905a5456f6da', amount: 123 };
      it('should return 400', async () => {
        const res = await server.inject({
          method: 'POST',
          url: '/amount',
          headers: incorrect_headers,
          payload: correct_payload,
        });
        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
