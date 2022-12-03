pragma circom 2.0.0;

// Poly activation layer: https://arxiv.org/abs/2011.05530
template Poly (n) {
    signal input in;
    signal output out;
    
    out <== in * in + n*in;
}