pragma circom 2.0.0;

include "../../circuits/AveragePooling2D.circom";

// poolSize=strides - default Keras settings
component main = AveragePooling2D(5, 5, 3, 2, 2, 250);