import React, { useEffect } from "react";
import { useChievHook } from "use-chiev";

const App = () => {
  const { clones, getURI, numTokenOfGen0 } = useChievHook();
  useEffect(() => {
    const getOnChainData = async () => {
      const count = await numTokenOfGen0(
        "0xCED608Aa29bB92185D9b6340Adcbfa263DAe075b",
        1
      );
      const uri = await getURI(1);
      console.log("count", count);
      console.log("uri", uri);
    };
    getOnChainData();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <h1>Chive Token Hook</h1>
      <p>clones.usersTokens has a lits of NFT owners and the tokens they own</p>
      <p>getURI will return the meta data uri from any token</p>
      <p>getURI will return the meta data uri from any token</p>
      {clones?.usersTokens &&
        clones.usersTokens.map((owner) => {
          return (
            <div key={owner.address}>
              <h4>owner: {owner.address}</h4>
              <h5>Tokens</h5>
              <ul>
                {owner.tokens.map((token) => {
                  return (
                    <li key={token.tokenId}>
                      <p>
                        id: {token.tokenId} type: {token.type} cloned from:{" "}
                        {token.clonedFromId}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
    </div>
  );
};
export default App;
