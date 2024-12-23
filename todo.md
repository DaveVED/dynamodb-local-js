# Local DynamoDB

Items that are _requried_ before we can have a initial `0.0.1` relase. Until then the proejct will remain in `beta`.

## Todo Tasks

### `start()`

- [x] **Setup Factory Stub**

  - Create a basic factory stub as the foundation for the project, initially including just the `start()` method.

- [x] **Download DynamoDB Local JAR**

  - Allow the user to provide a local path or URL for the DynamoDB Local JAR.
  - If no path or URL is provided, automatically download the latest version.

- [ ] **Check for Existing Process**

  - Ensure that no existing DynamoDB process is running before starting a new one.

- [x] **Support Modes**

  - Add support for both `inMemory` and `shared` modes.

- [x] **Spawn DynamoDB Process**
  - Implement functionality to spawn the DynamoDB process.

### `stop()`

- [x] **Terminate Process**
  - Add logic to gracefully kill the running DynamoDB process.

### `liveness`

- ` return dynamoDbProcess !== null;`
- Use this if you only want to check that the DynamoDB Local process is alive and running.

### `readiness`

- Use this if you want to check whether DynamoDB Local is ready to handle API requests.
- Example: Sending a health check HTTP request to http://localhost:8000/ to verify the service is up.

### `restart()`

- Restart

### `configure()`

- Updates the internal configuration of your localDynamoDb instance dynamically.
- Ensures the new options will take effect on the next start operation.
- `Object.assign(options, newOptions);`

### `port()` / `mode()`

### `status()`

- meta data.

### Test

- `start()`
  - [ ] I can download the \*.jar file from the www with a proivded url or the default url.
  - [ ] I can download the \*.jar file from the local destination with a provided url.
  - [ ] All downloads eitehr www or local should go to the `.local_dynamodb` folder.
  - [ ] When I download it should extract the `zip` contents to the `local_dynamodb` unless otherwise stated (user can tell us no extract so we just save the zip)
  - [ ] DynamoDB should statup using the contents downloaded to `local_dynamodb`
