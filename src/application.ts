import hapi from '@hapi/hapi';
import { registerEndpoints } from './api/register-endpoints';
import { disconnect, getOrCreateDb } from './db/db';

export let server: hapi.Server | undefined;

export async function startService(): Promise<hapi.Server> {
  server = hapi.server({
    port: 0,
    host: 'localhost',
  });
  await Promise.all([registerEndpoints(server), getOrCreateDb()]);
  await server.start();
  return server;
}

export async function stopService() {
  if (server) {
    await server.stop();
  }
  await disconnect();
  server = undefined;
}
