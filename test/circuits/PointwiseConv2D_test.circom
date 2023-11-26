pragma circom 2.0.0;

include "../../circuits/PointwiseConv2D.circom";

component main = PointwiseConv2D(5, 5, 3, 6, 10**15);
