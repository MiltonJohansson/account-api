import { startService, stopService } from '../../application';
import { Server } from '@hapi/hapi';

describe('Ping', () => {
  let server: Server;
  beforeAll(async () => {
    server = await startService();
  });
  afterAll(async () => {
    await stopService();
  });
  describe('call endpoint', () => {
    it('should return 200', async () => {
      const res = await server.inject({ method: 'GET', url: '/ping' });
      expect(res.statusCode).toEqual(200);
      expect(res.result).toEqual({});
    });
  });
});
