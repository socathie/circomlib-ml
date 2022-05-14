pragma circom 2.0.3;

include "./util.circom";

// ReLU layer
template ReLU () {
    signal input in;
    signal output out;

    component isPositive = IsPositive();

    isPositive.in <== in;
    
    out <== in * isPositive.out;
}