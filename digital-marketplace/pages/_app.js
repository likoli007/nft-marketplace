import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div >
      <nav className="border-b p-6 flex justify-center">
        <p className="text-4xl font-serif font-bold italic">!NFT auctionhouse!</p><br></br>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-6 text-green-500">Browse</a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-green-500">Create NFT</a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-green-500">Bought NFTs</a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-green-500">Creator Dashboard</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
