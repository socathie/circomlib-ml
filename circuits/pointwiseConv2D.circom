pragma circom 2.1.1;
// include "./Conv2D.circom";

include "./node_modules/circomlib/circuits/sign.circom";
include "./node_modules/circomlib/circuits/bitify.circom";
include "./node_modules/circomlib/circuits/comparators.circom";
include "./node_modules/circomlib-matrix/circuits/matElemMul.circom";
include "./node_modules/circomlib-matrix/circuits/matElemSum.circom";
include "./util.circom";

// Pointwise Convolution layer
// Note that nFilters must be a multiple of nChannels
template PointwiseConv2D (nRows, nCols, nChannels, nFilters) {
    var outRows = nRows; // kernel size and strides are 1
    var outCols = nCols;

    signal input in[nRows][nCols][nChannels];
    signal input weights[nChannels][nFilters]; // weights are 3d because depth is 1
    signal input bias[nFilters];
    signal output out[outRows][outCols][nFilters];

    component sum[outRows][outCols][nFilters];

    for (var row=0; row<outRows; row++) {
        for (var col=0; col<outCols; col++) {
            for (var filter=0; filter<nFilters; filter++) {
                sum[row][col][filter] = Sum(nChannels);
                for (var channel=0; channel<nChannels; channel++) {
                    sum[row][col][filter].in[channel] <== in[row][col][channel] * weights[channel][filter];
                }
                out[row][col][filter] <== sum[row][col][filter].out + bias[filter];
            }
        }
    }
}


// component main = PointwiseConv2D(32, 32, 8, 16);
