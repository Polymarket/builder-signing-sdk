# builder-signing-sdk

A TypeScript SDK for creating authenticated Polymarket builder headers.

## Installation

```bash
pnpm add @polymarket/builder-signing-sdk
```

## Quick start

Use `BuilderConfig` with local builder API credentials when the signing secret may safely remain in the application process:

```typescript
import { BuilderConfig } from '@polymarket/builder-signing-sdk';

const builderConfig = new BuilderConfig({
  localBuilderCreds: {
    key: process.env.POLY_BUILDER_API_KEY!,
    secret: process.env.POLY_BUILDER_SECRET!,
    passphrase: process.env.POLY_BUILDER_PASSPHRASE!,
  },
});

const headers = await builderConfig.generateBuilderHeaders(
  'POST',
  '/order',
  '{"marketId":"0x123"}',
);
```

Use a remote signer when the signing secret is isolated in a separate service. Remote signer URLs must use HTTPS and must not include URL credentials. The optional token is sent as a bearer token.

```typescript
import { BuilderConfig } from '@polymarket/builder-signing-sdk';

const builderConfig = new BuilderConfig({
  remoteBuilderConfig: {
    url: process.env.POLY_REMOTE_SIGNER_URL!,
    token: process.env.POLY_REMOTE_SIGNER_TOKEN,
  },
});

const headers = await builderConfig.generateBuilderHeaders(
  'POST',
  '/order',
  '{"marketId":"0x123"}',
);
```

Do not commit API keys, signing secrets, passphrases, or remote signer tokens.
