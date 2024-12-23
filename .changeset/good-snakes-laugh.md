---
"local-dynamodb-js": patch
---

Cleaned up the TS docs, and added in new functions to the localDynamodDb setup. You can now get the set port or mode, along with re confgure your container options and restart it. also provided some liveness and readiness checks. Lastly gave user a status helper with basic information, and wrote some tests. Need to figure out workspaces so i can add in example.
