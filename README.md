# Faucet RPC Service
A website for requesting testnet faucet funds.
- Supports GitHub login and provides 1 SUI on testnet per GitHub account daily
- Provides 1 SUI on testnet daily for accounts holding at least 0.1 SUI on mainnet

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.12.3 (`npm install -g pnpm`)

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install
```

## Development

```bash
# Run in development mode
pnpm dev

# Build the project
pnpm build

# Start the production server
pnpm start
```

## Quick Start

### 1. Install pnpm if you haven't already:
```bash
npm install -g pnpm
```

### 2. Install dependencies:
```bash
pnpm install
```

### 3. Create a `.env` file:
You need to register a GitHub OAuth application at [github.com/settings/developers](https://github.com/settings/developers)
The mnemonic is used to generate the private key for the faucet account.

Configure the clientId in site_config.ts

#### 3.1 File: .env
```bash
export MNEMONIC=<your mnemonic here>
export clientId=<your client id from github oauth site>
export clientSecret=<your client secret from github oauth site>
```

#### 3.2 Before debugging:
```bash
source .env
```
### 4 debug on localhost:
#### 4.1 change GithubPage.tsx
```ts
import {github_config_faucet as config} from './site_config'
```
to
```ts
import {github_config_local as config}from './site_config'
```

#### 4.2 Run local server
```bash
pnpm devp
```

#### 4.3 Access in web browser
Visit 'http://localhost:6789'

### 5. Deploy to Vercel
#### 5.1 Enable redirect to `https://wwww.faucet.mov`
Modify GithubPage.tsx:
```ts
import {github_config_faucet as config} from './site_config'
```

#### 5.2 Upload
```bash
pnpm upload
```

#### 5.3 Test
Access `https://wwww.faucet.mov` in your browser

### 6. GitHub OAuth Process Flow
- For GitHub authentication token details, see: [oauth](./github-oauth.md)





