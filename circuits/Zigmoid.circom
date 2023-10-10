pragma circom 2.0.0;

// Polynomial approximation for the sigmoid layer: https://www.researchgate.net/publication/342138268_SecureBP_from_Homomorphic_Encryption
// 0.500781 + 0.14670403 * x + 0.001198 * x**2 - 0.001006 * x**3
// 50078100 + 14670403 * x + 119800 * x**2 - 100600 * x**3
// 50078100 + x * (14670403 + 119800 * x - 100600 * x**2)
// n = 10 to the power of the number of decimal places
// out and remainder are from division by n**2 so out has the same number of decimal places as in
template Zigmoid (n) {
    signal input in;
    signal input out;
    signal input remainder;
    
    assert(remainder < (n**2) * (10**8));

    signal tmp;

    tmp <== 14670403 * n**2 + 119800 * n * in - 100600 * in * in;
    out * (n**2) * (10**8) + remainder === 50078100 * n**3 + in * tmp;
}

// component main { public [ out ] } = Zigmoid(10**9);

/* INPUT = {
    "in":  "123456789",
    "out": "518908974",
    "remainder": "92207237835436793754858600"
} */