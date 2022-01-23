const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const ec = new EC('secp256k1');
const secp = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes, hexToBytes } = require("ethereum-cryptography/utils");


const verifyMessage = async (message, privateKey, publicKey) => {
  const messageHash = SHA256(message);
  const signature = await secp.sign(messageHash, privateKey);
  return secp.verify(signature, messageHash, publicKey);
}

verifyMessage(10, '0x04754e3bce0d73a5c538b378c15a4190053ff91e722717d0ccbca076e2a4', '0xc7b4da4fd67673c6627557f37f6f9d2b1a384391dfc6ef42cdf4458f5050beda');