#!/bin/bash

# Input variables
# - SERVER_ADDRESS
# - SERVER_PORT


curl -k --header "Content-Type: application/json" \
-d @request-body-jp.json \
https://${SERVER_ADDRESS}:${SERVER_PORT:-11443}/api/v1/polly -o response.mp3

