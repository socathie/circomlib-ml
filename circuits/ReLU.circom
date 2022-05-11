pragma circom 2.0.3;

include "util.circom";

// ReLU layer
template ReLU (m,n) {
    signal input in[m][n];
    signal output out[m][n];

    component isPositive[m][n];
    
    for (var i=0; i<m; i++) {
        for (var j=0; j<n; j++) {
            isPositive[i][j] = IsPositive();

            isPositive[i][j].in <== in[i][j];

            out[i][j] <== in[i][j] * isPositive[i][j].out;
        }
    }
}