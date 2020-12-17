import * as React from "react";
import { ChievsService } from "./utils/chiev-service";

const addresses = {
  chievs: "0xb16d0b4ae564410DA88064300cdd3B8ae2BCcd6E",
};

export const useChievHook = () => {
  let [clones, setState] = React.useState({});
  const chievsService = new ChievsService(addresses.chievs);

  const getURI = async (tokenId) => {
    const uri = await chievsService.getTokenUri(tokenId);
    return uri;
  };

  const numTokenOfGen0 = async (owner, gen0TokenId) => {
    const count = await chievsService.numTokenOfGen0(owner, gen0TokenId);
    return count;
  };

  React.useEffect(() => {
    const getChievs = async (service) => {
      const tokenData = await service.getLogs();
      setState({ ...tokenData });
    };

    getChievs(chievsService);

    // polling every 10 min?
    let interval = window.setInterval(() => {
      getChievs(chievsService);
    }, 600000);
    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return { clones, getURI, numTokenOfGen0 };
};
