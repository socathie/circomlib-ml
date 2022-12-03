pragma circom 2.0.0;

include "../../circuits/ReLU.circom";

template relu_test() {
    signal input in[3];
    signal output out[3];

    component relu[3];

    for (var i=0; i<3; i++) {
        relu[i] = ReLU();

        relu[i].in <== in[i];
        out[i] <== relu[i].out;
    }
}

component main = relu_test();