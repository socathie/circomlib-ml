pragma circom 2.0.0;

include "./Conv2D.circom";

template Conv2Dsame (nRows, nCols, nChannels, nFilters, kernelSize, strides, n) {
    signal input in[nRows][nCols][nChannels];
    signal input weights[kernelSize][kernelSize][nChannels][nFilters];
    signal input bias[nFilters];

    var rowPadding, colPadding;

    if (nRows % strides == 0) {
        rowPadding = (kernelSize - strides) > 0 ? (kernelSize - strides) : 0;
    } else {
        rowPadding = (kernelSize - (nRows % strides)) > 0 ? (kernelSize - (nRows % strides)) : 0;
    }

    if (nCols % strides == 0) {
        colPadding = (kernelSize - strides) > 0 ? (kernelSize - strides) : 0;
    } else {
        colPadding = (kernelSize - (nCols % strides)) > 0 ? (kernelSize - (nCols % strides)) : 0;
    }

    signal input out[(nRows+rowPadding-kernelSize)\strides+1][(nCols+colPadding-kernelSize)\strides+1][nFilters];
    signal input remainder[(nRows+rowPadding-kernelSize)\strides+1][(nCols+colPadding-kernelSize)\strides+1][nFilters];

    component conv2d = Conv2D(nRows+rowPadding, nCols+colPadding, nChannels, nFilters, kernelSize, strides, n);

    for (var i = rowPadding\2; i < rowPadding\2+nRows; i++) {
        for (var j = colPadding\2; j < colPadding\2+nCols; j++) {
            for (var k = 0; k < nChannels; k++) {
                conv2d.in[i][j][k] <== in[i-rowPadding\2][j-colPadding\2][k];
            }
        }
    }

    for (var i = 0; i< rowPadding\2; i++) {
        for (var j = 0; j < nCols+colPadding; j++) {
            for (var k = 0; k < nChannels; k++) {
                conv2d.in[i][j][k] <== 0;
            }
        }
    }

    for (var i = nRows+rowPadding\2; i < nRows+rowPadding; i++) {
        for (var j = 0; j < nCols+colPadding; j++) {
            for (var k = 0; k < nChannels; k++) {
                conv2d.in[i][j][k] <== 0;
            }
        }
    }

    for (var i = rowPadding\2; i < nRows+rowPadding\2; i++) {
        for (var j = 0; j < colPadding\2; j++) {
            for (var k = 0; k < nChannels; k++) {
                conv2d.in[i][j][k] <== 0;
            }
        }
    }
    
    for (var i = rowPadding\2; i < nRows+rowPadding\2; i++) {
        for (var j = nCols+colPadding\2; j < nCols+colPadding; j++) {
            for (var k = 0; k < nChannels; k++) {
                conv2d.in[i][j][k] <== 0;
            }
        }
    }

    for (var i = 0; i < kernelSize; i++) {
        for (var j = 0; j < kernelSize; j++) {
            for (var k = 0; k < nChannels; k++) {
                for (var l = 0; l < nFilters; l++) {
                    conv2d.weights[i][j][k][l] <== weights[i][j][k][l];
                }
            }
        }
    }

    for (var i = 0; i < nFilters; i++) {
        conv2d.bias[i] <== bias[i];
    }

    for (var i = 0; i < (nRows+rowPadding-kernelSize)\strides+1; i++) {
        for (var j = 0; j < (nCols+colPadding-kernelSize)\strides+1; j++) {
            for (var k = 0; k < nFilters; k++) {
                conv2d.out[i][j][k] <== out[i][j][k];
                conv2d.remainder[i][j][k] <== remainder[i][j][k];
            }
        }
    }
}