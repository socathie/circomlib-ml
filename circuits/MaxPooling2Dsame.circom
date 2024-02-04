pragma circom 2.0.0;

include "./MaxPooling2D.circom";

template MaxPooling2Dsame (nRows, nCols, nChannels, poolSize, strides) {
    signal input in[nRows][nCols][nChannels];
    
    var rowPadding, colPadding;

    if (nRows % strides == 0) {
        rowPadding = (poolSize - strides) > 0 ? (poolSize - strides) : 0;
    } else {
        rowPadding = (poolSize - (nRows % strides)) > 0 ? (poolSize - (nRows % strides)) : 0;
    }

    if (nCols % strides == 0) {
        colPadding = (poolSize - strides) > 0 ? (poolSize - strides) : 0;
    } else {
        colPadding = (poolSize - (nCols % strides)) > 0 ? (poolSize - (nCols % strides)) : 0;
    }

    signal input out[(nRows+rowPadding-poolSize)\strides+1][(nCols+colPadding-poolSize)\strides+1][nChannels];

    component max2d = MaxPooling2D(nRows+rowPadding, nCols+colPadding, nChannels, poolSize, strides);

    for (var i = rowPadding\2; i < rowPadding\2+nRows; i++) {
        for (var j = colPadding\2; j < colPadding\2+nCols; j++) {
            for (var k = 0; k < nChannels; k++) {
                max2d.in[i][j][k] <== in[i-rowPadding\2][j-colPadding\2][k];
            }
        }
    }

    for (var i = 0; i< rowPadding\2; i++) {
        for (var j = 0; j < nCols+colPadding; j++) {
            for (var k = 0; k < nChannels; k++) {
                max2d.in[i][j][k] <== 0;
            }
        }
    }

    for (var i = nRows+rowPadding\2; i< nRows+rowPadding; i++) {
        for (var j = 0; j < nCols+colPadding; j++) {
            for (var k = 0; k < nChannels; k++) {
                max2d.in[i][j][k] <== 0;
            }
        }
    }

    for (var i = rowPadding\2; i < nRows+rowPadding\2; i++) {
        for (var j = 0; j < colPadding\2; j++) {
            for (var k = 0; k < nChannels; k++) {
                max2d.in[i][j][k] <== 0;
            }
        }
    }

    for (var i = rowPadding\2; i < nRows+rowPadding\2; i++) {
        for (var j = nCols+colPadding\2; j < nCols+colPadding; j++) {
            for (var k = 0; k < nChannels; k++) {
                max2d.in[i][j][k] <== 0;
            }
        }
    }

    for (var i = 0; i < (nRows+rowPadding-poolSize)\strides+1; i++) {
        for (var j = 0; j < (nCols+colPadding-poolSize)\strides+1; j++) {
            for (var k = 0; k < nChannels; k++) {
                max2d.out[i][j][k] <== out[i][j][k];
            }
        }
    }
}