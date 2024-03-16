pragma circom 2.0.0;

include "../../circuits/PReLU.circom";

template prelu_test() {
    signal input in[3];
    signal input out[3];
    signal input remainder[3];

    component prelu[3];

    for (var i=0; i<3; i++) {
        prelu[i] = PReLU(3);

        prelu[i].in <== in[i];
        prelu[i].out <== out[i];
        prelu[i].remainder <== remainder[i];
    }
}

component main = prelu_test();