pragma circom 2.0.0;

include "../../circuits/AveragePooling2D.circom";

// poolSize!=strides
component main = AveragePooling2D(10, 10, 3, 3, 2, 111);