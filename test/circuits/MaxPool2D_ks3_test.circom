pragma circom 2.0.3;

include "../../contracts/circuits/MaxPool2D.circom";

template maxpool2d_test(kernel_size) {
    signal input in[kernel_size][kernel_size];
    signal output out;

    component maxpool;

    maxpool = MaxPool2D(kernel_size);
    for (var i = 0; i < kernel_size; i++) {
        for (var j = 0; j < kernel_size; j++) {
            maxpool.in[i][j] <== in[i][j];
        }
    }
    out <== maxpool.out;
}

component main = maxpool2d_test(3);