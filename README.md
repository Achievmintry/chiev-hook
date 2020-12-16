# use-chiev

> use chiev nft info

[![NPM](https://img.shields.io/npm/v/use-chiev.svg)](https://www.npmjs.com/package/use-chiev) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-chiev
```

## Usage

```jsx
import React, { Component } from 'react'

  const { clones, getURI, numTokenOfGen0 } = useChievHook();
  useEffect(() => {
    const getOnChainData = async () => {
      const count = await numTokenOfGen0(
        "<eth address>",
        1
      );
      const uri = await getURI(1);

    };
    getOnChainData();
    // eslint-disable-next-line
  }, []);

const Example = () => {
  const example = useMyHook()
  return (
      <div>
      <h1>Chive Token Hook</h1>
      <p>clones.usersTokens has a lits of NFT owners and the tokens they own</p>
      <p>getURI will return the meta data uri from any token</p>
      <p>getURI will return the meta data uri from any token</p>
      </div>
  )
}
```

## License

MIT © [dekanbro](https://github.com/dekanbro)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
