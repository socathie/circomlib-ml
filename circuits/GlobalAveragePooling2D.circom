pragma circom 2.0.0;

include "./GlobalSumPooling2D.circom";

// GlobalAveragePooling2D layer, might lose precision compared to GlobalSumPooling2D
// scaledInvPoolSize is required to perform fixed point division, it is calculated as 1/(nRows*nCols) then scaled up by multiples of 10
template GlobalAveragePooling2D (nRows, nCols, nChannels, scaledInv) {
    signal input in[nRows][nCols][nChannels];
    signal output out[nChannels];

    component globalSumPooling2D = GlobalSumPooling2D (nRows, nCols, nChannels);

    for (var i=0; i<nRows; i++) {
        for (var j=0; j<nCols; j++) {
            for (var k=0; k<nChannels; k++) {
                globalSumPooling2D.in[i][j][k] <== in[i][j][k];
            }
        }
    }

    for (var k=0; k<nChannels; k++) {
        out[k] <== globalSumPooling2D.out[k]*scaledInv;
    }
}