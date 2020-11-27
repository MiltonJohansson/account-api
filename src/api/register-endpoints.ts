import { Server, Request, ResponseToolkit } from '@hapi/hapi';
import {
  validateGetAccountBalance,
  validateGetTransaction,
  validatePostAmountRequest,
  validateGetTransactionResponse,
  validateGetBalanceResponse,
  validateGetMaximumTransactionsResponse,
} from '../validate/validation';
import { getLatestTransaction, getMaximumNumberOfTransactions, getTransaction, storeTransaction } from '../db/db';
import { pick } from 'lodash';

export async function registerEndpoints(server: Server) {
  server.route({
    method: 'GET',
    path: '/ping',
    handler: handlePing,
  });
  server.route({
    method: 'POST',
    path: '/amount',
    handler: handlePostAmount,
    options: {
      validate: validatePostAmountRequest(),
    },
  });
  server.route({
    method: 'GET',
    path: '/transaction/{transaction_id}',
    handler: handleGetTransaction,
    options: {
      validate: validateGetTransaction(),
      response: {
        schema: validateGetTransactionResponse(),
        failAction: 'error',
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/balance/{account_id}',
    handler: handleGetAccountBalance,
    options: {
      validate: validateGetAccountBalance(),
      response: {
        schema: validateGetBalanceResponse(),
        failAction: 'error',
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/max_transaction_volume',
    handler: handleGetMaximumTransactionVolume,
    options: {
      response: {
        schema: validateGetMaximumTransactionsResponse(),
        failAction: 'error',
      },
    },
  });
}

const handlePing = async (_req: Request, h: ResponseToolkit) => {
  return h.response({}).code(200);
};

const handlePostAmount = async ({ payload, headers }: Request, h: ResponseToolkit) => {
  try {
    await storeTransaction({
      transaction_id: headers['transaction-id'],
      account_id: (payload as any).account_id,
      amount: (payload as any).amount,
    });
    return h.response({}).code(200);
  } catch (error) {
    throw error;
  }
};

const handleGetTransaction = async ({ params: { transaction_id } }: Request, h: ResponseToolkit) => {
  try {
    const transaction = await getTransaction(transaction_id);
    return h.response(pick(transaction, ['account_id', 'amount'])).code(200);
  } catch (error) {
    throw error;
  }
};

const handleGetAccountBalance = async ({ params: { account_id } }: Request, h: ResponseToolkit) => {
  try {
    const latest_transaction = await getLatestTransaction(account_id);
    return h.response(pick(latest_transaction, ['balance'])).code(200);
  } catch (error) {
    throw error;
  }
};

const handleGetMaximumTransactionVolume = async (_req: Request, h: ResponseToolkit) => {
  try {
    const maximum_transactions = await getMaximumNumberOfTransactions();
    const response = {
      maxVolume: maximum_transactions[0].number_of_transactions,
      accounts: maximum_transactions.map((transaction: any) => transaction.account_id),
    };
    return h.response(response).code(200);
  } catch (error) {
    throw error;
  }
};
