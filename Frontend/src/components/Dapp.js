import React from "react";

import { ethers } from "ethers";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { Login } from "./Login";
import { TestAuthorisation } from "./TestAuthorisation";


// This is the Hardhat Network id, you might change it in the hardhat.config.js.
// If you are using MetaMask, be sure to change the Network id to 1337.
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = '31337';
const API_URL = "http://localhost:8080"

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {

      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      networkError: undefined,
      loggedIn: false,
      loading: false,
      authorisedData: ''
    };

    this.state = this.initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    if (this.state.loading) {
      return (
        <Loading />
      )
    }


    if (!this.state.loggedIn) {
      return (
        <Login login={() => this._login()} />
      );
    }


    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>Welcome</h1>
            <p>JWT TOKEN: {window.localStorage.getItem("TOKEN")}</p>

            {
              this.state.authorisedData === '' ? (
                <TestAuthorisation getAuthorisedData={() => this._getAuthorisedData()} />
              ) : (
                <p>{this.state.authorisedData}</p>
              )
            }

          </div>
        </div>
      </div>
    );
  }


  async _getAuthorisedData() {
    this.setState({
      loading: true,
    });

    //fetch message
    const res = await fetch(`${API_URL}/api/test/user`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': window.localStorage.getItem("TOKEN")
      },
    });

    const content = await res.json();
    console.log(content.message)
    this.setState({
      loading: false,
      authorisedData: content.message
    });
  }

  async _login() {
    this.setState({
      loading: true,
    });
    //fetch message
    const authChallengeRes = await fetch(`${API_URL}/api/auth/authChallenge`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 'address': this.state.selectedAddress })
    });

    const contentAuthChallenge = await authChallengeRes.json();

    //request signature
    const message = contentAuthChallenge.message;
    try {
      const from = this.state.selectedAddress;
      const msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`;
      const sign = await window.ethereum.request({
        method: 'personal_sign',
        params: [msg, from, ''],
      });

      console.log("OK SIGNED")
      //try authentication

      const authVerifyRes = await fetch(`${API_URL}/api/auth/auth_verify`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'address': this.state.selectedAddress, 'signature': sign })
      });

      const contentAuthVerify = await authVerifyRes.json();
      const token = contentAuthVerify.accessToken;
      window.localStorage.setItem("TOKEN", token);

      console.log(window.localStorage.getItem("TOKEN"));

      this.setState({
        loggedIn: true,
        loading: false
      });

    } catch (err) {
      console.error(err);
    }
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on("chainChanged", ([networkId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp
    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();
  }

  async _initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);
  }



  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545 
  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: 'Please connect Metamask to Localhost:8545'
    });

    return false;
  }
}
