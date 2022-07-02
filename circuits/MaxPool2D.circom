pragma circom 2.0.0;

include "../../node_modules/circomlib-ml/circuits/circomlib/comparators.circom";
include "../../node_modules/circomlib-ml/circuits/circomlib/switcher.circom";

// MaxPool2D layer
// case kernel_size == stride
template MaxPool2D(kernel_size) {
    signal input in[kernel_size][kernel_size];
    signal output out;

    component gts[kernel_size + 1][kernel_size];        // store comparators
    component switchers[kernel_size + 1][kernel_size];  // switcher for comparing maxs

    signal maxs[kernel_size + 1][kernel_size];

    for (var i = 0; i < kernel_size; i++) {
        for (var j = 0; j < kernel_size; j++) {
            if (j == 0) {
                maxs[i][0] <== in[i][0];
            } else {
                gts[i][j-1] = GreaterThan(252); // changed to 252 (maximum) for better compatibility
                switchers[i][j-1] = Switcher();

                gts[i][j-1].in[1] <== maxs[i][j-1];
                gts[i][j-1].in[0] <== in[i][j];

                switchers[i][j-1].sel <== gts[i][j-1].out;
                switchers[i][j-1].L <== maxs[i][j-1];
                switchers[i][j-1].R <== in[i][j];

                maxs[i][j] <== switchers[i][j-1].outL;
            }
        }
    }

    for (var i = 0; i < kernel_size; i++) {
        if (i == 0) {
            maxs[kernel_size][i] <== maxs[i][kernel_size-1];
        } else {
            gts[kernel_size][i-1] = GreaterThan(252); // changed to 252 (maximum) for better compatibility
            switchers[kernel_size][i-1] = Switcher();

            gts[kernel_size][i-1].in[1] <== maxs[kernel_size][i-1];
            gts[kernel_size][i-1].in[0] <== maxs[i][kernel_size-1];

            switchers[kernel_size][i-1].sel <== gts[kernel_size][i-1].out;
            switchers[kernel_size][i-1].L <== maxs[kernel_size][i-1];
            switchers[kernel_size][i-1].R <== maxs[i][kernel_size-1];

            maxs[kernel_size][i] <== switchers[kernel_size][i-1].outL;
        }
    }

    out <== maxs[kernel_size][kernel_size-1];
}