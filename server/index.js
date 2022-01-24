const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const secp = require("@noble/secp256k1");

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const numberOfAddresses = 3;

const balances = {};
const keyPair = {};

const generateKey = () => {
  let privateKey = secp.utils.randomPrivateKey();
  privateKey = Buffer.from(privateKey).toString('hex');
  const publicKey = secp.getPublicKey(privateKey);
  const shortPublicKey = '0x' + publicKey.slice(publicKey.length - 40);
  balances[shortPublicKey] = 100;
  keyPair[shortPublicKey] = privateKey;
}

const verifyMessage = async (privateKey, publicKey) => {
   const publicKeyFromPrivateKey = secp.getPublicKey(privateKey);
   return publicKeyFromPrivateKey === publicKey;
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
  const isSigned = await verifyMessage(privateKey, sender);
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
