pragma circom 2.0.3;

include "./circomlib-matrix/matElemSum.circom";
include "./util.circom";

// SumPooling2D layer, basically AveragePooling2D layer with a constant scaling, more optimized for circom, strides=poolSize like Keras default
template SumPooling2D (nRows, nCols, nChannels, poolSize) {
    signal input in[nRows][nCols][nChannels];
    signal output out[nRows\poolSize][nCols\poolSize][nChannels];

    component elemSum[nRows\poolSize][nCols\poolSize][nChannels];

    for (var i=0; i<nRows\poolSize; i++) {
        for (var j=0; j<nCols\poolSize; j++) {
            for (var k=0; k<nChannels; k++) {
                elemSum[i][j][k] = matElemSum(poolSize,poolSize);
                for (var x=0; x<poolSize; x++) {
                    for (var y=0; y<poolSize; y++) {
                        elemSum[i][j][k].a[x][y] <== in[i*poolSize+x][j*poolSize+y][k];
                    }
                }
                out[i][j][k] <== elemSum[i][j][k].out;
            }
        }
    }
}