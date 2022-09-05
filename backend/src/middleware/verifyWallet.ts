import * as ethers from 'ethers'
import { RequestHandler } from 'express'

const verifyWallet: RequestHandler = (req, res, next) => {

  if (!req.body.address) {
    return res.status(403).send({
      message: "No wallet address set"
    })
  }

  if (!req.body.networkName || !req.body.networkName.match(/^[0-9a-z]+$/)) {
    return res.status(403).send({
      message: "No networkName or invalid : " + req.body.networkName
    })
  }

  try {
    req.body.address = ethers.utils.getAddress(req.body.address)
    next()
    return
  } catch (e: any) {
    return res.status(403).send({
      message: "Not valid wallet address " + req.body.address + " " + e.message
    })
  }
};

export {
  verifyWallet,
};
