const { ethers } = require('ethers');

/**
 * Generates a new random Ethereum-compatible wallet
 * @returns {Object} address and privateKey
 */
exports.generateWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey
    };
};

/**
 * Validates a wallet address
 * @param {string} address 
 * @returns {boolean}
 */
exports.isValidAddress = (address) => {
    return ethers.isAddress(address);
};
