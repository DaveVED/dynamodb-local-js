---
"local-dynamodb-js": patch
---

Initial release of LocalDynamoDb to npm. It contains the bare basic functionality needed in order to use the local dynamodb container. A user can at this point start() and stop() a container. And the start() handles the downloading of the local client unless the user tells us to use a local jar.
