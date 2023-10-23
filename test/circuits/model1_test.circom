pragma circom 2.0.0;

include "../../circuits/Dense.circom";
include "../../circuits/ReLU.circom";

template model1() {
    signal input in[3];

    signal input Dense32weights[3][2];
    signal input Dense32bias[2];
    signal input Dense32out[2];
    signal input Dense32remainder[2];

    signal input ReLUout[2];

    signal input Dense21weights[2][1];
    signal input Dense21bias[1];
    signal input Dense21out[1];
    signal input Dense21remainder[1];

    signal output out;

    component Dense32 = Dense(3,2, 10**36);
    component relu[2];
    component Dense21 = Dense(2,1, 10**36);

    for (var i=0; i<3; i++) {
        Dense32.in[i] <== in[i];
        for (var j=0; j<2; j++) {
            Dense32.weights[i][j] <== Dense32weights[i][j];
        }
    }

    for (var i=0; i<2; i++) {
        Dense32.bias[i] <== 0;
        Dense32.out[i] <== Dense32out[i];
        Dense32.remainder[i] <== Dense32remainder[i];
    }

    for (var i=0; i<2; i++) {
        relu[i] = ReLU();
        relu[i].in <== Dense32.out[i];
        relu[i].out <== ReLUout[i];
    }

    for (var i=0; i<2; i++) {
        Dense21.in[i] <== relu[i].out;
        Dense21.weights[i][0] <== Dense21weights[i][0];
    }
    
    Dense21.bias[0] <== 0;
    Dense21.out[0] <== Dense21out[0];
    Dense21.remainder[0] <== Dense21remainder[0];

    out <== Dense21.out[0];
}

component main = model1();