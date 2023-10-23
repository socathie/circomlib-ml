pragma circom 2.0.0;

include "../../circuits/Conv2D.circom";
include "../../circuits/Dense.circom";
include "../../circuits/ArgMax.circom";
include "../../circuits/ReLU.circom";
include "../../circuits/AveragePooling2D.circom";
include "../../circuits/BatchNormalization2D.circom";
include "../../circuits/Flatten2D.circom";

template mnist() {
    signal input in[28][28][1];

    signal input conv2d_1_weights[3][3][1][4];
    signal input conv2d_1_bias[4];
    signal input conv2d_1_out[26][26][4];
    signal input conv2d_1_remainder[26][26][4];

    signal input bn_1_a[4];
    signal input bn_1_b[4];
    signal input bn_1_out[26][26][4];
    signal input bn_1_remainder[26][26][4];

    signal input relu_1_out[26][26][4];

    signal input avg2d_1_out[13][13][4];
    signal input avg2d_1_remainder[13][13][4];

    signal input conv2d_2_weights[3][3][4][8];
    signal input conv2d_2_bias[8];
    signal input conv2d_2_out[11][11][8];
    signal input conv2d_2_remainder[11][11][8];

    signal input bn_2_a[8];
    signal input bn_2_b[8];
    signal input bn_2_out[11][11][8];
    signal input bn_2_remainder[11][11][8];

    signal input relu_2_out[11][11][8];

    signal input avg2d_2_out[5][5][8];
    signal input avg2d_2_remainder[5][5][8];

    signal input flatten_out[200];

    signal input dense_weights[200][10];
    signal input dense_bias[10];
    signal input dense_out[10];
    signal input dense_remainder[10];

    signal input argmax_out;

    signal output out;

    component conv2d_1 = Conv2D(28,28,1,4,3,1,10**18);
    component bn_1 = BatchNormalization2D(26,26,4,10**18);
    component relu_1[26][26][4];
    component avg2d_1 = AveragePooling2D(26,26,4,2,2);
    component conv2d_2 = Conv2D(13,13,4,8,3,1,10**18);
    component bn_2 = BatchNormalization2D(11,11,8,10**18);
    component relu_2[11][11][8];
    component avg2d_2 = AveragePooling2D(11,11,8,2,2);
    component flatten = Flatten2D(5,5,8);
    component dense = Dense(200,10,10**18);
    component argmax = ArgMax(10);

    for (var i=0; i<28; i++) {
        for (var j=0; j<28; j++) {
            conv2d_1.in[i][j][0] <== in[i][j][0];
        }
    }

    for (var m=0; m<4; m++) {
        for (var i=0; i<3; i++) {
            for (var j=0; j<3; j++) {
                conv2d_1.weights[i][j][0][m] <== conv2d_1_weights[i][j][0][m];
            }
        }
        conv2d_1.bias[m] <== conv2d_1_bias[m];
    }

    for (var k=0; k<4; k++) {
        bn_1.a[k] <== bn_1_a[k];
        bn_1.b[k] <== bn_1_b[k];
        for (var i=0; i<26; i++) {
            for (var j=0; j<26; j++) {
                conv2d_1.out[i][j][k] <== conv2d_1_out[i][j][k];
                conv2d_1.remainder[i][j][k] <== conv2d_1_remainder[i][j][k];
                bn_1.in[i][j][k] <== conv2d_1.out[i][j][k];
            }
        }
    }


    for (var i=0; i<26; i++) {
        for (var j=0; j<26; j++) {
            for (var k=0; k<4; k++) {
                bn_1.out[i][j][k] <== bn_1_out[i][j][k];
                bn_1.remainder[i][j][k] <== bn_1_remainder[i][j][k];
                relu_1[i][j][k] = ReLU();
                relu_1[i][j][k].in <== bn_1.out[i][j][k];
                relu_1[i][j][k].out <== relu_1_out[i][j][k];
                avg2d_1.in[i][j][k] <== relu_1[i][j][k].out;
            }
        }
    }

    for (var i=0; i<13; i++) {
        for (var j=0; j<13; j++) {
            for (var k=0; k<4; k++) {
                avg2d_1.out[i][j][k] <== avg2d_1_out[i][j][k];
                avg2d_1.remainder[i][j][k] <== avg2d_1_remainder[i][j][k];
                conv2d_2.in[i][j][k] <== avg2d_1.out[i][j][k];
            }
        }
    }

    for (var m=0; m<8; m++) {
        for (var i=0; i<3; i++) {
            for (var j=0; j<3; j++) {
                for (var k=0; k<4; k++) {
                    conv2d_2.weights[i][j][k][m] <== conv2d_2_weights[i][j][k][m];
                }
            }
        }
        conv2d_2.bias[m] <== conv2d_2_bias[m];
    }

    for (var k=0; k<8; k++) {
        bn_2.a[k] <== bn_2_a[k];
        bn_2.b[k] <== bn_2_b[k];
        for (var i=0; i<11; i++) {
            for (var j=0; j<11; j++) {
                conv2d_2.out[i][j][k] <== conv2d_2_out[i][j][k];
                conv2d_2.remainder[i][j][k] <== conv2d_2_remainder[i][j][k];
                bn_2.in[i][j][k] <== conv2d_2.out[i][j][k];
            }
        }
    }

    for (var i=0; i<11; i++) {
        for (var j=0; j<11; j++) {
            for (var k=0; k<8; k++) {
                bn_2.out[i][j][k] <== bn_2_out[i][j][k];
                bn_2.remainder[i][j][k] <== bn_2_remainder[i][j][k];
                relu_2[i][j][k] = ReLU();
                relu_2[i][j][k].in <== bn_2.out[i][j][k];
                relu_2[i][j][k].out <== relu_2_out[i][j][k];
                avg2d_2.in[i][j][k] <== relu_2[i][j][k].out;
            }
        }
    }

    for (var i=0; i<5; i++) {
        for (var j=0; j<5; j++) {
            for (var k=0; k<8; k++) {
                avg2d_2.out[i][j][k] <== avg2d_2_out[i][j][k];
                avg2d_2.remainder[i][j][k] <== avg2d_2_remainder[i][j][k];
                flatten.in[i][j][k] <== avg2d_2.out[i][j][k];
            }
        }
    }

    for (var i=0; i<200; i++) {
        flatten.out[i] <== flatten_out[i];
        dense.in[i] <== flatten.out[i];
        for (var j=0; j<10; j++) {
            dense.weights[i][j] <== dense_weights[i][j];
        }
    }

    for (var i=0; i<10; i++) {
        dense.bias[i] <== dense_bias[i];
    }

    for (var i=0; i<10; i++) {
        dense.out[i] <== dense_out[i];
        dense.remainder[i] <== dense_remainder[i];
        argmax.in[i] <== dense.out[i];
    }

    argmax.out <== argmax_out;
    out <== argmax.out;
}

component main = mnist();