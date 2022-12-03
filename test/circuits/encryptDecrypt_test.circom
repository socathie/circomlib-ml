pragma circom 2.0.0;

include "../../circuits/crypto/encrypt.circom";
include "../../circuits/crypto/ecdh.circom";

// from zk-ml/linear-regression-demo

template Test() {
    signal input message;
    signal input shared_key;
    signal output out;
    signal input private_key;
    signal input public_key[2];

    component ecdh = Ecdh();

    ecdh.private_key <== private_key;
    ecdh.public_key[0] <== public_key[0];
    ecdh.public_key[1] <== public_key[1];

    log(ecdh.shared_key);
    log(shared_key);
    log(private_key);
    log(public_key[0]);
    log(public_key[1]);

    shared_key === ecdh.shared_key;

    component enc = Encrypt();
    component dec = Decrypt();

    message ==> enc.plaintext;
    shared_key ==> enc.shared_key;
    shared_key ==> dec.shared_key;
    enc.out[0] ==> dec.message[0];
    enc.out[1] ==> dec.message[1];

    log(dec.out);
    dec.out === message;
    out <== 1;
}

component main = Test();