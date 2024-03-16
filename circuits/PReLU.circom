pragma circom 2.0.0;

include "./util.circom";

// PReLU layer
template PReLU (alpha) {  // alpha is 10 times the actual alpha, since usual alpha is 0.2, 0.3, etc.
    signal input in;
    signal input out;
    //signal input alpha; 
    signal input remainder;
    
    component isNegative = IsNegative();

    isNegative.in <== in;

    signal neg;
    neg <== isNegative.out * alpha * in;

    out * 10 + remainder === neg + 10 * in * (1 - isNegative.out);
}