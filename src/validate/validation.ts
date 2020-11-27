import joi from 'joi';

export function validatePostAmountRequest() {
  return {
    headers: joi.object({
      'transaction-id': joi.string().uuid().required(),
    }),
    options: {
      allowUnknown: true,
    },
    payload: joi.object({
      account_id: joi.string().uuid().required(),
      amount: joi.number().integer().required(),
    }),
  };
}

export function validateGetTransactionResponse() {
  return joi.object({
    account_id: joi.string().uuid().required(),
    amount: joi.number().integer().required(),
  });
}

export function validateGetTransaction() {
  return {
    params: joi.object({
      transaction_id: joi.string().uuid().required(),
    }),
  };
}

export function validateGetBalanceResponse() {
  return joi.object({
    balance: joi.number().integer().required(),
  });
}

export function validateGetAccountBalance() {
  return {
    params: joi.object({
      account_id: joi.string().uuid().required(),
    }),
  };
}

export function validateGetMaximumTransactionsResponse() {
  return joi.object({
    maxVolume: joi.number().integer(),
    accounts: joi.allow(joi.string().uuid().required()),
  });
}
