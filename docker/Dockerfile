FROM --platform=linux/amd64 ubuntu:18.04

WORKDIR /root

RUN apt-get update && apt-get install -y wget sudo python3 python3-pip cmake gdb
RUN pip3 install --upgrade pip
RUN pip3 install --user eosfactory-tokenika
RUN wget https://github.com/EOSIO/eos/releases/download/v2.1.0/eosio_2.1.0-1-ubuntu-18.04_amd64.deb
RUN wget https://github.com/EOSIO/eosio.cdt/releases/download/v1.8.1/eosio.cdt_1.8.1-1-ubuntu-18.04_amd64.deb
RUN sudo apt install -y ./eosio_2.1.0-1-ubuntu-18.04_amd64.deb ./eosio.cdt_1.8.1-1-ubuntu-18.04_amd64.deb