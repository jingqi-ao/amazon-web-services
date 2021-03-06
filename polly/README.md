# aws polly service

## Pre-requisites

(1) SSL certificate and private key should be generated by user and placed in folder ./certs 
- SSL certificate: ./certs/server.crt
- SSL private key: ./certs/server.key

(2) AWS API access credentials
- AWS access key id
- AWS secrete access key
Ref: http://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html

_Note: AWS API credentials will be used as environment variables when running docker container_

## Language support
See: https://docs.aws.amazon.com/polly/latest/dg/SupportedLanguage.html

## How to run polly server
AWS polly server is now running as docker container

(1) Build docker image
```
$ cd docker
# Default docker image name is: "aws-polly-server". You can choose other names.
$ export DOCKER_IMAGE_FULL_NAME=aws-polly-server
$ ./build-server-image.sh
```

(2) Run docker container
```
$ docker run -d --restart=on-failure -p 8443:8443 \
--env AWS_ACCESS_KEY_ID="you-aws-key-id" \
--env AWS_SECRET_ACCESS_KEY="you-aws-secret-key" \
--name aws-polly-server \
aws-polly-server
```