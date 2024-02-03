pragma circom 2.0.0;

include "../../circuits/LeakyReLU.circom";

template leaky_relu_test() {
    signal input in[3];
    signal input out[3];
    signal input remainder[3];

    component leaky_relu[3];

    for (var i=0; i<3; i++) {
        leaky_relu[i] = LeakyReLU(3);

        leaky_relu[i].in <== in[i];
        leaky_relu[i].out <== out[i];
        leaky_relu[i].remainder <== remainder[i];
    }
}

component main = leaky_relu_test();