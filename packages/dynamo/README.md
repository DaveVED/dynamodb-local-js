# local-dynamo

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.38. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

```typescript
console.log("Waiting for DynamoDB Local to be ready...");
for (let attempt = 0; attempt < 10; attempt++) {
  const isHealthy = await checkHealth(port);
  if (isHealthy) {
    console.log("DynamoDB Local is ready.");
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

console.error("DynamoDB Local failed to start within the timeout period.");
this.stop();
throw new Error("DynamoDB Local health check failed.");

const options: LocalDynamoDbOptions = { port: 8000, mode: "inMemory" };
const { start, stop } = localDynamoDb(options);

await start();
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
await delay(5000); // Wait for 3 seconds
stop();
```
