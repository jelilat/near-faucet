import logo from './logo.svg';
import './App.css';
import * as nearAPI from "near-api-js";
import { useState } from "react"
global.Buffer = global.Buffer || require('buffer').Buffer

function App() {
  const { connect, keyStores, WalletConnection, KeyPair } = nearAPI;
  const [userAccountId, setAccountId] = useState()

  // const signIn = async () => {
  //   const near = await connect(config);
  //   // create wallet connection
  //   const wallet = new WalletConnection(near);

  //   wallet.requestSignIn(
  //     "hello.tjelailah.testnet", // contract requesting access
  //     "Example App", // optional
  //     "localhost:3000", // optional
  //     "http://YOUR-URL.com/failure" // optional
  //   );
  // };

  const sendNEAR = async () => {
    const lastRequestTime = window.localStorage.getItem("lastRequestTime");
    if (!lastRequestTime || Date.now() - lastRequestTime > 259200000) {
      const keyStore = new keyStores.BrowserLocalStorageKeyStore();
      const config = {
        networkId: "testnet",
        keyStore, 
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
      };
      const near = await connect(config);
      const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000) + 10000000000000);
      const devAccountId = `dev-${Date.now()}-${randomNumber}`;
      const keyPair = await KeyPair.fromRandom('ed25519');
      await near.accountCreator.createAccount(devAccountId, keyPair.publicKey);
      await keyStore.setKey("testnet", devAccountId, keyPair);

      const account = await near.account(devAccountId);
      await account.deleteAccount(userAccountId); 
      window.localStorage.setItem("lastRequestTime", Date.now());
    } else {
      alert("Please wait 3 days before requesting new testnet tokens")
    }
  }
  return (
    <div>
      <h1 style={{textAlign: 'center'}}>NEAR Testnet Faucet</h1>
      <div className="form">
        <label>Enter your Account ID</label><br />
        <input type="text" placeholder="tjelailah.testnet" onChange={(e) => setAccountId(e.target.value)} /><br />
        <button onClick={() => sendNEAR()}
          disabled={userAccountId === undefined}>Send Me NEAR</button>
      </div>
      <div className="faqs">
        <h2>FAQS</h2>
        <p><b>How do I use this?</b></p>
        <p>To request funds, simply enter your testnet wallet id and hit “Send Me NEAR".</p>
        <p><b>How does it work?</b></p>
        <p>You can sen ~200 NEAR every 3 days.</p>
        <p><b>It worked! How can I say thank you?</b></p>
        
      </div>
      <div className="footer">
        <p>Create with ❤️ by <a href="https://twitter.com/tjelailah" target="_blank">@tjelailah</a></p>
        
      </div>
    </div>
  );
}

export default App;
