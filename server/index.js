const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const ec = new EC('secp256k1');
const secp = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes, hexToBytes } = require("ethereum-cryptography/utils");


const key = ec.genKeyPair();

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const numberOfAddresses = 3;

const balances = {};
const keyPair = {};

const generateKey = () => {
  const key = ec.genKeyPair();
  const publicKey = key.getPublic().encode('hex');
  const shortPublicKey = '0x' + publicKey.toString('hex').slice(0, -70);
  balances[shortPublicKey] = 100;
  keyPair[shortPublicKey] = '0x' + key.getPrivate().toString(16);
}


const verifyMessage = async (message, privateKey, publicKey) => {
  console.log('BEFORE MESSAGE HASH ! ');
  const messageHash = utf8ToBytes(SHA256(message));
  const signature = await secp.sign(messageHash, utf8ToBytes(privateKey));
  return secp.verify(signature, messageHash, utf8ToBytes(publicKey));
}

// get the balance of an address
app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});
// send an amount from the sender to the recipient
app.post('/send', async (req, res) => {
  const {sender, recipient, amount, privateKey} = req.body;
  const isSigned = await verifyMessage(amount, privateKey, sender);
  if (isSigned) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + parseInt(amount);
  } else {
    throw new Error('Invalid Private Key!');
  }
  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!\n`);
  console.log('Available Accounts');
  console.log('==================');

  for (let i=0; i<numberOfAddresses; i++) {
    generateKey();
  }
  Object.keys(balances).forEach((address, index) => console.log(`(${index}) ${address} (${balances[address]} ETH)`));
  console.log('\nPrivate Keys');
  console.log('============');
  Object.keys(keyPair).forEach((address, index) => console.log(`(${index}) ${keyPair[address]} `));
});


verifyMessage(10, '0x04754e3bce0d73a5c538b378c15a4190053ff91e722717d0ccbca076e2a4', '0xc7b4da4fd67673c6627557f37f6f9d2b1a384391dfc6ef42cdf4458f5050beda');