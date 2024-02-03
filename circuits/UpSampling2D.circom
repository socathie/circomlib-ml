pragma circom 2.0.0;

template UpSampling2D(nRows, nCols, nChannels, size) {
    signal input in[nRows][nCols][nChannels];
    signal input out[nRows * size][nCols * size][nChannels];

    // nearest neighbor interpolation
    for (var i = 0; i < nRows; i++) {
        for (var j = 0; j < nCols; j++) {
            for (var c = 0; c < nChannels; c++) {
                for (var k = 0; k < size; k++) {
                    for (var l = 0; l < size; l++) {
                        out[i * size + k][j * size + l][c] === in[i][j][c];
                    }
                }
            }
        }
    }
}