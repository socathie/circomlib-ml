pragma circom 2.0.3;

include "../../circuits/Conv2D.circom";
include "../../circuits/Dense.circom";
include "../../circuits/ArgMax.circom";
include "../../circuits/Poly.circom";
include "../../circuits/SumPooling2D.circom";

template mnist_convnet() {
    signal input in[28][28][1];
    signal input conv2d_1_weights[3][3][1][4];
    signal input conv2d_1_bias[4];
    signal input conv2d_2_weights[3][3][4][8];
    signal input conv2d_2_bias[8];
    signal input dense_weights[200][10];
    signal input dense_bias[10];
    signal output out;

    component conv2d_1 = Conv2D(28,28,1,4,3,1);
    component poly_1[26][26][4];
    component sum2d_1 = SumPooling2D(26,26,4,2,2);
    component conv2d_2 = Conv2D(13,13,4,8,3,1);
    component poly_2[11][11][8];
    component sum2d_2 = SumPooling2D(11,11,8,2,2);
    component dense = Dense(200,10);
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

    for (var i=0; i<26; i++) {
        for (var j=0; j<26; j++) {
            for (var k=0; k<4; k++) {
                poly_1[i][j][k] = Poly(10**6);
                poly_1[i][j][k].in <== conv2d_1.out[i][j][k];
                sum2d_1.in[i][j][k] <== poly_1[i][j][k].out;
            }
        }
    }

    for (var i=0; i<13; i++) {
        for (var j=0; j<13; j++) {
            for (var k=0; k<4; k++) {
                conv2d_2.in[i][j][k] <== sum2d_1.out[i][j][k];
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

    for (var i=0; i<11; i++) {
        for (var j=0; j<11; j++) {
            for (var k=0; k<8; k++) {
                poly_2[i][j][k] = Poly(10**15);
                poly_2[i][j][k].in <== conv2d_2.out[i][j][k];
                sum2d_2.in[i][j][k] <== poly_2[i][j][k].out;
            }
        }
    }

    var idx = 0;

    for (var i=0; i<5; i++) {
        for (var j=0; j<5; j++) {
            for (var k=0; k<8; k++) {
                dense.in[idx] <== sum2d_2.out[i][j][k];
                for (var m=0; m<10; m++) {
                    dense.weights[idx][m] <== dense_weights[idx][m];
                }
                idx++;
            }
        }
    }

    for (var i=0; i<10; i++) {
        dense.bias[i] <== dense_bias[i];
    }

    for (var i=0; i<10; i++) {
        log(dense.out[i]);
        argmax.in[i] <== dense.out[i];
    }

    out <== argmax.out;
}

component main = mnist_convnet();