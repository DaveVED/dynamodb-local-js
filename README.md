<p align="center">
  <a href="https://localdynamodb.js.org">
    <picture>
      <img src="https://raw.githubusercontent.com/DaveVED/local-dynamodb-js/main/assets/logo-light.png" alt="LocalDynamoDb logo">
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@openauthjs/openauth">
    <img alt="npm version" src="https://img.shields.io/npm/v/%40openauthjs%2Fcore?style=flat-square" />
  </a>
  <a href="https://github.com/openauthjs/openauth/actions/workflows/release.yml">
    <img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/openauthjs/openauth/release.yml?style=flat-square&branch=master" />
  </a>
</p>

---

# LocalDynamoDb

[LocalDynamoDb](https://localdynamodb.js.org) is a lightweight, standalone adapter for spinning up and managing local DynamoDB containers. It provides a practical and reliable solution for users who need a quick alternative for testing DynamoDB locally in JavaScript-based projects (Node.js, Bun, Deno, etc.).

Offering a lightweight and practical alternative to more comprehensive solutions like [_LocalStack test containers_](https://docs.localstack.cloud/user-guide/integrations/testcontainers/), it addresses the need for a modern, maintained option. Many JavaScript/TypeScript libraries supporting local DynamoDB testing have become stale, and LocalDynamoDb bridges this gap.

## Table of Contents

- [Key Features](#key-features)
- [Installation](#installation)
- [Usage](#usage)
- [Contribution](#contribution)

## Key Features

- **Universal**: Works with any existing JavaScript or TypeScript test framework, assuming your OS supports it (e.g., Java must be installed).
- **Lightweight**: Minimal dependencies, keeping the project simple and efficient.
- **Standards-based**: Follows AWS's implementation pattern for running DynamoDB locally, ensuring compatibility for anyone using DynamoDB.
- **Customizable**: Easily manage your local DynamoDB container. Configure options like port, in-memory mode, shared databases, and handle operations like start, stop, restart, or integrate it into your workflows as needed.

## Installation

You can install _LocalDynamoDb_ using any of the major JavaScript runtimes.

| Runtime | Command                          |
| ------- | -------------------------------- |
| Bun     | `bun add local-dynamodb-js`      |
| npm     | `npm install local-dynamodb-js`  |
| pnpm    | `pnpm add local-dynamodb-js`     |
| Deno    | `deno install local-dynamodb-js` |

Select the command based on your runtime of choice, and you're ready to get started!

## Tutorial

To get started quickly, check out our [_examples_](https://github.com/DaveVED/local-dynamodb-js/tree/main/examples). If you'd like to follow along with a simple tutorial, let's go through the setup and usage.

### Create a Container

First, create your _LocalDynamoDb_ container. This will automatically download the latest DynamoDB version unless you specify a version or use a local copy.

```typescript
import { localDynamoDb } from "local-dynamodb-js";

const { start, stop } = localDynamoDb({
  port: 8000,
  mode: "inMemory",
});
```
### Start and Stop the Container

Once your container is set up, you can start and stop it using the provided functions.

```typescript
import { localDynamoDb } from "local-dynamodb-js";

const { start, stop } = localDynamoDb({ port: 8000, mode: "inMemory" });

await start();           // Start the DynamoDB instance
await setTimeout(2000);  // Wait for 2 seconds
stop();                  // Stop the DynamoDB instance
```

## Contribution

_LocalDynamoDb_ is officially open source and no longer just public source. Since LocalDynamoDb is small, we aim to solve _the problem_ with _proper hooks_ rather than addressing highly specific issues. With that said, pull requests (PRs) for valid issues, features, and enhancements are welcome.

To get started with contributions, check out our [Contribution Guide](https://localdynamodb.js.org/contribute).

---

_LocalDynamoDb_ is developed by [Dave Dennis](https://davedennis.dev). If you'd like to contribute, please check out the contribution guide or file an issue. For urgent matters, feel free to email me at [me@davedennis.dev](mailto:me@davedennis.dev).
