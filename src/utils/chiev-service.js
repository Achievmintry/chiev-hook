import { abis } from "../abis";
import Web3 from "web3";

export class ChievsService {
  web3;
  contract;

  constructor(tokenAddr, web3 = null) {
    if (!web3) {
      console.log("new web3");
      web3 = new Web3(
        new Web3.providers.HttpProvider('https://xdai.poanetwork.dev')
      );
    }
    this.web3 = web3;
    this.contract = new web3.eth.Contract(abis.chievs, tokenAddr);

    this.sendTx = this.sendTx; // eslint-disable-line
    this.tokenOfOwnerByIndex = this.tokenOfOwnerByIndex; // eslint-disable-line
    this.getChievsById = this.getChievsById; // eslint-disable-line
    this.getNumClonesInWild = this.getNumClonesInWild; // eslint-disable-line
    this.getLatestId = this.getLatestId; // eslint-disable-line
    this.displayPrice = this.displayPrice; // eslint-disable-line
    this.getLogs = this.getLogs; // eslint-disable-line
    // this.getOwnedForAccount = this.getOwnedForAccount; // eslint-disable-line
    this.getTokenUri = this.getTokenUri; // eslint-disable-line
  }

  sendTx(name, tx, callback, from, value) {
    return tx
      .send({ from: from, value: value })
      .on("transactionHash", (txHash) => {
        console.log("txHash", txHash);
        callback(txHash, name);
      })
      .on("error", (error) => callback(null, error));
  }

  async numTokenOfGen0(owner, gen0tokenId) {
    let count;
    try {
      count = await this.contract.methods
        .numTokenOfGen0(owner, gen0tokenId)
        .call();
    } catch {
      count = 0;
    }

    return count;
  }

  async getChievsById(tokenId) {
    let token;
    try {
      token = await this.contract.methods.getChievsById(tokenId).call();
      return token;
    } catch {
      return undefined;
    }
  }

  async getTokenUri(tokenId) {
    try {
      const uri = await this.contract.methods.tokenURI(tokenId).call();
      const data = await fetch(uri);
      return data.json();
    } catch {
      return undefined;
    }
  }

  async getNumClonesInWild(tokenId) {
    let count;
    try {
      count = await this.contract.methods.getNumClonesInWild(tokenId).call();
      return count;
    } catch {
      return undefined;
    }
  }

  async getLatestId() {
    let count;
    try {
      count = await this.contract.methods.getLatestId().call();
      return count;
    } catch {
      return undefined;
    }
  }

  displayPrice(price) {
    price = price.toString();
    return this.web3.utils.fromWei(price);
  }

  async getLogs() {
    const allEvents = await this.contract.getPastEvents("AllEvents", {
      fromBlock: 0,
      toBlock: "latest",
    });

    const transferLogs = allEvents.filter((e) => e.event === "Transfer");
    const gen0Logs = allEvents.filter((e) => e.event === "MintGen0");
    const cloneLogs = allEvents.filter((e) => e.event === "Clone");
    // TODO: index other events

    // sort log oldest to newest so latest transfer is owner
    const sortedTransfers = transferLogs.sort(function(a, b) {
      return a.blockNumber - b.blockNumber;
    });
    // get the original owners
    // the first transfer maybe the one that counts
    const origOwners = {};
    sortedTransfers.forEach((item) => {
      const account = item.returnValues.to.toLowerCase();
      if (
        item.returnValues.from === "0x0000000000000000000000000000000000000000"
      ) {
        origOwners[account] = origOwners[account] || [];
        origOwners[account].push(item.returnValues.tokenId);
      }
    });

    // current owners in the case that someone has transfered ownership
    const currentOwners = {};
    sortedTransfers.forEach((item) => {
      const account = item.returnValues.to.toLowerCase();
      currentOwners[account] = currentOwners[account] || [];
      currentOwners[account].push(item.returnValues.tokenId);
    });
    
    // get all clone token info
    const clones = cloneLogs.map((token) => {
      return {
        type: "clone",
        sender: token.returnValues.sender,
        reciever: token.returnValues.receiver,
        tokenId: token.returnValues.tokenId,
        clonedFromId: token.returnValues.clonedFromId,
        tokenOwnerFee: token.returnValues.tokenOwnerFee,
        contractOwnerFee: token.returnValues.contractOwnerFee,
        ownedBy: Object.keys(currentOwners).find(
          (owner) =>
            currentOwners[owner].indexOf(token.returnValues.tokenId) > -1
        ),
      };
    });

    // get all gen0 token info
    const gen0s = gen0Logs.map((token) => {
      return {
        type: "gen0",
        sender: null,
        reciever: token.returnValues.to,
        tokenId: token.returnValues.tokenId,
        clonedFromId: token.returnValues.tokenId,
        numClonesAllowed: token.returnValues.numClonesAllowed,
        cloner: token.returnValues.cloner,
        priceFinney: token.returnValues.priceFinney,
        ownedBy: Object.keys(currentOwners).find(
          (owner) =>
            currentOwners[owner].indexOf(token.returnValues.tokenId) > -1
        ),
        clones: clones.filter(
          (clone) => clone.clonedFromId === token.returnValues.tokenId
        ),
      };
    });
    // get all token info
    const allTokens = [...clones, ...gen0s];

    // get all tokens for all the current owners
    const usersTokens = [];
    Object.keys(currentOwners).forEach((key) => {
      const item = {
        address: key,
        tokens: allTokens.filter((token) => token.ownedBy === key),
      };
      usersTokens.push(item);
    });


    return {
      origOwners,
      currentOwners,
      usersTokens
    };
  }

}

export class Web3ChievsService extends ChievsService {
  constructor(...args) {
    super(...args);

    this.mint = this.mint; // eslint-disable-line
    this.burn = this.burn; // eslint-disable-line
    this.clone = this.clone; // eslint-disable-line
  }

  // admin
  async mint(to, from, priceFinney, numClonesAllowed, tokenURI) {
    await this.contract.methods.mint(
      to,
      priceFinney,
      numClonesAllowed,
      tokenURI
    );
  }

  // admin
  async burn(from, owner, tokenId) {
    await this.contract.methods.burn(owner, tokenId);
  }

  // public
  // async clone(to, from, tokenId, numClonesRequested, value, callback) {
  //   console.log("clone", from);
  //   const newTx = this.contract.methods.clone(to, tokenId, numClonesRequested);
  //   const txReceipt = this.sendTx(
  //     "clone",
  //     newTx,
  //     callback,
  //     from,
  //     value,
  //     callback
  //   );
  //   return txReceipt.transactionHash;
  // }
  async clone(to, from, tokenId, value, callback) {
    // to is an array
    console.log("clone", from);
    const newTx = this.contract.methods.clone(to, tokenId);
    const txReceipt = this.sendTx(
      "clone",
      newTx,
      callback,
      from,
      value,
      callback
    );
    return txReceipt.transactionHash;
  }
}
