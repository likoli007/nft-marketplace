import {ethers} from 'ethers'
import {useEffect, useState} from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
  nftaddress, nftmarketaddress
} from '../config'

import EnFT from '../artifacts/contracts/EnFT.sol/EnFT.json'
import Marketplace from '../artifacts/contracts/Marketplace.sol/Marketplace.json'

export default function Home() {
  const[nfts, setNfts] = useState([])
  const[loadingState, setLoadingState] = useState('not-loaded')
  const [formInput, updateFormInput] = useState({bid:''})
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs(){

    const provider = new ethers.providers.JsonRpcProvider()

    const tokenContract = new ethers.Contract(nftaddress, EnFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Marketplace.abi, provider)
    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async i =>{

      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)

      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let auction = ethers.utils.formatUnits(i.currentBid.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller:i.seller,
        owner:i.owner,
        auction,
        image:meta.data.image,
        name:meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    console.log("woo")
    setLoadingState('loaded')
  }
  async function buyNft(nft){

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Marketplace.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value:price
    })
    await transaction.wait()
    loadNFTs()
  }

  async function bidNft(nft){
    const{bid} = formInput
    console.log(bid)
    if(!bid) return

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Marketplace.abi, signer)
    /*
    const data = JSON.stringify({
      name, description, image:fileUrl
    })*/

    const price = ethers.utils.parseUnits(bid, 'ether')
    const transaction = await contract.setBid(price, nft.tokenId)
    await transaction.wait()
    loadNFTs()
  }
  if(loadingState === 'loaded' && !nfts.length) return(
    <h1 className= "px-20 py-10 text-3xl">No items in marketplace</h1>
  )

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{maxWidth: '1600px'}}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key = {i} className = "border shadow rounded-xl overflow-hidden">
                <img src={nft.image}/>
                <div className="p-4">
                  <p style = {{height: '64px'}} className="text-2xl font-semibold">{nft.name}</p>
                  <div style = {{height: '70px', overflow: 'hidden'}}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">buyout: {nft.price} ETH</p>
                  <p className="text-2xl mb-4 font-bold text-white">auction: {nft.auction} ETH</p>
                  <button className="w-full bg-green-500 text-black font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                  <input
                    placeholder="Your Bid (ETH)"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({...formInput, bid:e.target.value})}
                  />
                  <button className="w-full bg-green-500 text-black font-bold py-2 px-12 rounded" onClick={() => bidNft(nft)}>Bid</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
