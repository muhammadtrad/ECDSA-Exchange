const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key = ec.genKeyPair();

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const numberOfAddresses = 10;

const balances = {};
const keyPair = {};

const generateKey = () => {
  const key = ec.genKeyPair();
  const publicKey = key.getPublic().encode('hex');
  const shortPublicKey = '0x' + publicKey.toString('hex').slice(0, -70);
  balances[shortPublicKey] = 100;
  keyPair[shortPublicKey] = '0x' + key.getPrivate().toString(16);
}

// get the balance of an address 
app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});
// send an amount from the sender to the recipient
app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
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
