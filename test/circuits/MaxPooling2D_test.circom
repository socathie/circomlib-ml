pragma circom 2.0.3;

include "../../circuits/MaxPooling2D.circom";

// poolSize=strides - default Keras settings
component main = MaxPooling2D(5, 5, 3, 2, 2);