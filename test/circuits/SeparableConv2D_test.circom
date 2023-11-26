pragma circom 2.0.0;

include "../../circuits/SeparableConv2D.circom";

component main = SeparableConv2D(7, 7, 3, 3, 6, 3, 1, 10**15);
