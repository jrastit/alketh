import {
  fundWallet
} from '../controllers/walletController'

import {
  verifyWallet
} from '../middleware/verifyWallet'

import express from 'express'

const authRoute = function(app: express.Application) {
  app.use(function(_req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/wallet/fund",
    [verifyWallet],
    fundWallet
  );
};

export default authRoute
