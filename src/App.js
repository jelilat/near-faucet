import './App.css';
import * as nearAPI from "near-api-js";
import { useState } from "react"
global.Buffer = global.Buffer || require('buffer').Buffer

function App() {
  const { connect, keyStores, WalletConnection, KeyPair } = nearAPI;
  const [userAccountId, setAccountId] = useState()
  const [success, setSuccess] = useState(false)
  const [transactionHash, setTransactionHash] = useState()

  const accountValidity = async (near) => {
      await near.connection.provider.query({
        request_type: "view_account",
        finality: "final",
        account_id: userAccountId,
      })
      .catch(() => {
        alert(`Account ${userAccountId} does not exist`);
        window.location.reload();
      })

  }

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
      accountValidity(near);
      const randomNumber = Math.floor(Math.random() * (99999999999999 - 10000000000000) + 10000000000000);
      const devAccountId = `dev-${Date.now()}-${randomNumber}`;
      const keyPair = await KeyPair.fromRandom('ed25519');
      await near.accountCreator.createAccount(devAccountId, keyPair.publicKey);
      await keyStore.setKey("testnet", devAccountId, keyPair);

      const account = await near.account(devAccountId);
      await account.deleteAccount(userAccountId)
      .then((response) => {
        console.log(response.transaction.hash);
        const hash = response.transaction.hash;
        setTransactionHash(`https://explorer.testnet.near.org/transactions/${hash}`)
        setSuccess(true)
      })
      window.localStorage.setItem("lastRequestTime", Date.now());
    } else {
      alert("Please wait 3 days before requesting new testnet tokens")
    }
  }
  return (
    <div>
      <h1 style={{textAlign: 'center'}}>NEAR Testnet Faucet</h1>
      <p style={{textAlign: 'center'}}>Fast and reliable. 200 NEAR every 3 days.</p>
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
        <p>You can request ~200 NEAR every 3 days.</p>
        </div><br />
      {success && 
        <div className="success">
          Tokens sent successfully! View on <a href={transactionHash} target="_blank">explorer</a>
        </div>}
      <div className="footer">
        <p><a href="https://github.com/jelilat/near-faucet" target="_blank" rel="noreferrer">Github</a></p>
      </div>
    </div>
  );
}

export default App;
