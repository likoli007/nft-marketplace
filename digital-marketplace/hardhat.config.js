require("@nomiclabs/hardhat-waffle");
const fs = require("fs")
const privateKey = fs.readFileSync(".secret").toString()

const projectId = "b26cc21ed9d74cd1b3e49b5d6b3aed1f"

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai:{
      url:"https://rpc-mumbai.matic.today",
      accounts: [privateKey]
    },
    /*
    mainnet:{
      url: 'https://polygon-mainnet.infura.io/v3/b26cc21ed9d74cd1b3e49b5d6b3aed1f',
      accounts: [privateKey]
    },*/
  },
  solidity: "0.8.4",
};
