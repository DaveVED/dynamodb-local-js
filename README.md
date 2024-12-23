# local-dynamodb-js

A lightweight, standalone adapter for spinning up and managing local DynamoDB containers. It provides a practical and reliable solution for users who need a quick alternative for testing DynamoDB locally in JavaScript-based projects (Node.js, Bun, Deno, etc.).

Offering a lightweight and practical alternative to more comprehensive solutions like [_LocalStack test containers_](https://docs.localstack.cloud/user-guide/integrations/testcontainers/). It addresses the need for a modern, maintained option, as many JavaScript/TypeScript libraries supporting local DynamoDB testing have become stale.

- __Universal__: Works with any existing JavaScript or TypeScript test framework, assuming your OS supports it (e.g., Java must be installed).
- __Lightweight__: Minimal dependencies, keeping the project simple and efficient.
- __Standards-based__: Follows AWS's implementation pattern for running DynamoDB locally, ensuring compatibility for anyone using DynamoDB.
- __Customizable__: Easily manage your local DynamoDB container. Configure options like port, inMemory, sharedDb, and handle operations like start, stop, restart, or integrate it into your workflows as needed.

## ⇁ TOC

## ⇁ Getting Started