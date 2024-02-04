pragma circom 2.0.0;

include "../../circuits/MaxPooling2Dsame.circom";

// poolSize=strides - default Keras settings
component main = MaxPooling2Dsame(5, 5, 3, 2, 2);