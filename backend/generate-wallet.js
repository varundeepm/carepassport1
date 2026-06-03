const ethers = require('ethers');
const wallet = ethers.Wallet.createRandom();

console.log('\n===========================================');
console.log('YOUR WALLET INFO:');
console.log('===========================================');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('===========================================\n');
console.log('📋 COPY THIS ADDRESS:');
console.log(wallet.address);
console.log('\n🎯 GO TO: https://faucet.polygon.technology/');
console.log('   → Select "Polygon Amoy"');
console.log('   → Paste address above');
console.log('   → Click Submit');
console.log('   → Wait 1 minute\n');