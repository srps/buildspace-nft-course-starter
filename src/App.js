import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import MyEpicNFT from "./utils/MyEpicNFT.json";
import { Ellipsis } from "react-load-animations";

// Constants
const TWITTER_HANDLE = "serj_mig";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/squarenft-7laobwjr5j";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [currentSupply, setCurrentSupply] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);

  const CONTRACT_ADDRESS = "0x837e67956b53a4D46ba6ee5319089a2d1Fa8923A";
  const rinkebyChainId = "0x4";

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Wallet not connected");
    } else {
      let chainId = await ethereum.request({ method: "eth_chainId" });

      if (chainId !== rinkebyChainId) {
        alert(
          `You are not connected to Rinkeby Test Network. Please connect to that instead`
        );
      }
      console.log(`Wallet connected: ${ethereum}`);
      if (ethereum.isMetaMask) {
        console.log("Wallet is Metamask");
      }
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log(`Found account: ${account}`);
      if (account !== currentAccount) {
        setCurrentAccount(account);  
      }
    } else {
      console.log("No account found");
      setCurrentAccount(null);
    }
  };

  const connectWallet = async () => {
    const { ethereum } = window;

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log(`Found account: ${account}`);
      if (account !== currentAccount) {
        setCurrentAccount(account);  
      }
    } else {
      console.log("No account found");
      setCurrentAccount(null);
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Using MetaMask as provider and signer
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyEpicNFT.abi,
          signer
        );
        const currentSupply = await connectedContract.getCurrentTokenId();
        const maxSupply = await connectedContract.getMaxTokenSupply();
        setTotalSupply(maxSupply.toNumber());
        setCurrentSupply(currentSupply.toNumber());

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId);
          alert(
            `Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log(`Setup event listener`);
      } else {
        console.log("No Ethereum object found");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const mintNFT = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Using MetaMask as provider and signer
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyEpicNFT.abi,
          signer
        );

        console.log("Minting NFT...");
        let txn = await connectedContract.makeAnEpicNFT();
        setIsMinting(true);

        await txn.wait();
        setIsMinting(false);
        console.log(
          `Minted NFT on https://rinkeby.etherscan.io/tx/${txn.hash}`
        );
      } else {
        console.log("No Ethereum object found");
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  });

  useEffect(() => {
    setupEventListener()
  },[]);

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={mintNFT}
      disabled={isMinting}
    >
      Mint NFT
    </button>
  );

  const renderLoadingContainer = () => (
    <div className="loading">
      Minting
      <Ellipsis animating={true} />
    </div>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p className="sub-text">Minted {currentSupply}/{totalSupply}</p>
          {!currentAccount ? renderNotConnectedContainer() : renderMintUI()}
          {isMinting && renderLoadingContainer()}
        </div>
        <div className="opensea-container">
          <a
            className="opensea-button"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >
            🌊 View Collection on OpenSea
          </a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
