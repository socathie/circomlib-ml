pragma circom 2.0.0;

include "../../circuits/SumPooling2D.circom";

// poolSize=strides - default Keras settings
component main = SumPooling2D(5, 5, 3, 2, 2);