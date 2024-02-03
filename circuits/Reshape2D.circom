pragma circom 2.0.0;

// Reshape layer with that accepts a 1D input
template Reshape2D (nRows, nCols, nChannels) {
    signal input in[nRows*nCols*nChannels];
    signal input out[nRows][nCols][nChannels];

    for (var i=0; i<nRows; i++) {
        for (var j=0; j<nCols; j++) {
            for (var k=0; k<nChannels; k++) {
                out[i][j][k] === in[i*nCols*nChannels + j*nChannels + k];
            }
        }
    }
}