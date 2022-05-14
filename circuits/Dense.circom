pragma circom 2.0.3;

include "./circomlib-matrix/matMul.circom";
// Dense layer
template Dense (nInputs,nOutputs) {
    signal input in[nInputs];
    signal input weights[nInputs][nOutputs];
    signal input bias[nOutputs];
    signal output out[nOutputs];

    component dot[nOutputs];

    for (var i=0; i<nOutputs; i++) {
        dot[i] = matMul(1,nInputs,1);
        
        for (var j=0; j<nInputs; j++) {
            dot[i].a[0][j] <== in[j];
            dot[i].b[j][0] <== weights[j][i];
        }

        out[i] <== dot[i].out[0][0] + bias[i];
    }
}