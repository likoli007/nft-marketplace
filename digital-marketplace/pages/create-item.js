import {useState} from 'react'
import {ethers} from 'ethers'
import {create as ipfsHttpClient} from 'ipfs-http-client'
import {useRouter} from 'next/router'
import Web3Modal from 'web3modal'


const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import{
  nftaddress, nftmarketaddress
} from '../config'

import EnFT from '../artifacts/contracts/EnFT.sol/EnFT.json'
import Marketplace from '../artifacts/contracts/Marketplace.sol/Marketplace.json'

export default function CreateItem(){
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({price:'', name:'',description:''})
  const router = useRouter()

  async function onChange(e){
    const file = e.target.files[0]
    try{
      const added = await client.add(
        file,
        {
          progress:(prog) => console.log('received: ${prog}')
        }
      )
      const url =  ('https://ipfs.infura.io/ipfs/'+added.path)
      setFileUrl(url)
    }
    catch(error){
      console.log("Error uploadin file: ", error)
    }

  }

  async function createItem(){
    const{name, description, price} = formInput
    if(!name || !description || !price || !fileUrl) return
    const data = JSON.stringify({
      name, description, image:fileUrl
    })

    try{
      const added = await client.add(data)

      const url = ('https://ipfs.infura.io/ipfs/'+added.path)

      createSale(url)
    }catch(error){
      console.log('Error uploading file:', error)
    }
  }

  async function createSale(url){

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    let contract = new ethers.Contract(nftaddress, EnFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()

    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    contract = new ethers.Contract(nftmarketaddress, Marketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    transaction = await contract.createMarketItem(
      nftaddress, tokenId, price, {value: listingPrice}
    )
    await transaction.wait()
    router.push('/')

  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({...formInput, name:e.target.value})}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e=>updateFormInput({...formInput, description: e.target.value})}
        />
        <input
          placeholder="Buyout Price"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({...formInput, price: e.target.value})}
        />
        <input
          type="file"
          name="asset"
          className="my-4"
          onChange={onChange}
        />
        <button onClick = {createItem}
        className = "font-bold mt-4 bg-green-500 text-black rounded p-4 shadow-lg">
        Create</button>
      </div>
    </div>
  )
}
