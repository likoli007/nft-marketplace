instructions:

1. open 'config.js',this is the place the address of the contracts need to be pasted
2. in cmd, move to this project folder and use: npx hardhat node to start up different wallet accounts 
3. in a different cmd, use: npx hardhat run scripts/deploy.js --network localhost 
	to deploy the smart contracts on the localhost blocckchain, then copy their addresses from the cmd window
	into the 'config.js' file (market address into market address, nft into nft)
4. in yet another cmd window, use: npm run dev to start up the local server
5. the site is now live, connect some wallets to metamask (the private keys of the wallets are located in the 'hardhat node' cmd window)
	and test out the site


 