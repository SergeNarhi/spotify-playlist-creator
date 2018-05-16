#!/usr/bin/env bash

openssl aes-256-cbc -e -in .env/.qa -out .env/secure.qa.env -k $ENCRYPT_KEY
openssl aes-256-cbc -e -in .env/.master -out .env/secure.master.env -k $ENCRYPT_KEY