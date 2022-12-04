pragma circom 2.0.0;

include "./SumPooling2D.circom";

// AveragePooling2D layer, poolSize is required to be equal for both dimensions, might lose precision compared to SumPooling2D
// scaledInvPoolSize is required to perform fixed point division, it is calculated as 1/poolSize**2 then scaled up by multiples of 10
template AveragePooling2D (nRows, nCols, nChannels, poolSize, strides, scaledInvPoolSize) {
    signal input in[nRows][nCols][nChannels];
    signal output out[(nRows-poolSize)\strides+1][(nCols-poolSize)\strides+1][nChannels];

    component sumPooling2D = SumPooling2D (nRows, nCols, nChannels, poolSize, strides);

    for (var i=0; i<nRows; i++) {
        for (var j=0; j<nCols; j++) {
            for (var k=0; k<nChannels; k++) {
                sumPooling2D.in[i][j][k] <== in[i][j][k];
            }
        }
    }

    for (var i=0; i<(nRows-poolSize)\strides+1; i++) {
        for (var j=0; j<(nCols-poolSize)\strides+1; j++) {
            for (var k=0; k<nChannels; k++) {
                out[i][j][k] <== sumPooling2D.out[i][j][k]*scaledInvPoolSize;
            }
        }
    }
}