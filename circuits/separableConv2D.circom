pragma circom 2.1.1;

include "./pointwiseConv2D.circom";
include "./depthwiseConv2D.circom";

// Separable convolution layer with valid padding.
// Quantization is done by the caller by multiplying float values by 10**exp.
template SeparableConv2D (nRows, nCols, nChannels, nDepthFilters, nPointFilters, kernelSize, strides) {
    var outRows = (nRows-kernelSize)\strides+1;
    var outCols = (nCols-kernelSize)\strides+1;

    signal input in[nRows][nCols][nChannels];
    signal input depthWeights[kernelSize][kernelSize][nDepthFilters]; // weights are 3d because depth is 1
    signal input depthBias[nDepthFilters];

    signal input pointWeights[nChannels][nPointFilters]; // weights are 2d because kernelSize is one
    signal input pointBias[nPointFilters];

    signal output out[outRows][outCols][nPointFilters];

    component depthConv = DepthwiseConv2D(nRows, nCols, nChannels, nDepthFilters, kernelSize, strides);
    component pointConv = PointwiseConv2D(outRows, outCols, nDepthFilters, nPointFilters);

    for (var filter=0; filter<nDepthFilters; filter++) {
        for (var x=0; x<kernelSize; x++) {
            for (var y=0; y<kernelSize; y++) {
                depthConv.weights[x][y][filter] <== depthWeights[x][y][filter];
            }
        }
        depthConv.bias[filter] <== depthBias[filter];
    }

    for (var row=0; row < nRows; row++) {
        for (var col=0; col < nCols; col++) {
            for (var channel=0; channel < nChannels; channel++) {
                depthConv.in[row][col][channel] <== in[row][col][channel];
            }
        }
    }
    for (var row=0; row < outRows; row++) {
        for (var col=0; col < outCols; col++) {
            for (var filter=0; filter < nDepthFilters; filter++) {
                pointConv.in[row][col][filter] <== depthConv.out[row][col][filter];

            }
        }
    }

    for (var filter=0; filter < nPointFilters; filter++) {
        for (var channel=0; channel < nChannels; channel++) {
            pointConv.weights[channel][filter] <== pointWeights[channel][filter];
        }
        pointConv.bias[filter] <== pointBias[filter];
    }
    for (var row=0; row < outRows; row++) {
        for (var col=0; col < outCols; col++) {
            for (var filter=0; filter < nPointFilters; filter++) {
                out[row][col][filter] <== pointConv.out[row][col][filter];
            }
        }
    }
}
// component main = SeparableConv2D(34, 34, 8, 8, 16, 3, 1);
