#!/usr/bin/env bash
openssl aes-256-cbc -d -in config/secure.qa.yml -out config/qa.yml -k $ENCRYPT_KEY
openssl aes-256-cbc -d -in config/secure.production.yml -out config/production.yml -k $ENCRYPT_KEY