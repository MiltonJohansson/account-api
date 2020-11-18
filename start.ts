import { startService } from './src/application';

startService().catch((err: Error) => {
  console.log('Failed to start server', err);
});
