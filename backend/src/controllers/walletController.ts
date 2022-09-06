import db from '../models'
const Wallet = db.wallet
import { RequestHandler } from 'express'
import { faucet } from 'ethers-network'
import { Transaction } from 'sequelize'


const faucetWallet = async (req: any, t: Transaction, res: any) => {
  const privateKeys = require("../../../key/" + req.body.networkName.replace(/ /g, "") + "PrivateKeys.json")
  try {
    await faucet(req.body.address, req.body.networkName, privateKeys)
    console.log("faucet", req.ip, req.body.address)
    t.commit().then(() => {
      res.send({ message: "Wallet funded successfully!" })
    })
  }
  catch (err: any) {
    t.rollback()
    res.status(500).send({ message: err.message });
  };
}

const fundWallet: RequestHandler = (req, res) => {
  db.sequelize.transaction().then(t => {
    Wallet.findOne({
      where: {
        address: req.body.address
      }, transaction: t
    })
      .then((wallet) => {
        if (wallet && wallet.lastFunding && wallet.lastFunding.getTime() + (1000 * 3600) > new Date().getTime()) {
          t.rollback()
          return res.status(403).send({ message: "Wallet already funded last hour." });
        }
        else if (!wallet) {
          Wallet.create({
            address: req.body.address,
            lastFunding: new Date()
          }, { transaction: t }).then(() => {
            faucetWallet(req, t, res)
          })
        } else {
          wallet.lastFunding = new Date()
          wallet.save({ transaction: t }).then(() => {
            faucetWallet(req, t, res)
          })
        }
      })
      .catch(err => {
        t.rollback()
        res.status(500).send({ message: err.message });
      });
  }).catch(err => {
    res.status(500).send({ message: err.message });
  });
};

export { fundWallet }
