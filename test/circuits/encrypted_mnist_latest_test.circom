pragma circom 2.0.0;

include "../../circuits/Conv2D.circom";
include "../../circuits/Dense.circom";
include "../../circuits/ArgMax.circom";
include "../../circuits/Poly.circom";
include "../../circuits/AveragePooling2D.circom";
include "../../circuits/BatchNormalization2D.circom";
include "../../circuits/Flatten2D.circom";
include "../../circuits/crypto/encrypt.circom";
include "../../circuits/crypto/ecdh.circom";

template encrypted_mnist_latest() {
    signal input in[28][28][1];
    signal input conv2d_1_weights[3][3][1][4];
    signal input conv2d_1_bias[4];
    signal input bn_1_a[4];
    signal input bn_1_b[4];
    signal input conv2d_2_weights[3][3][4][8];
    signal input conv2d_2_bias[8];
    signal input bn_2_a[8];
    signal input bn_2_b[8];
    signal input dense_weights[200][10];
    signal input dense_bias[10];
    signal output out;

    signal input private_key;
    signal input public_key[2];

    component ecdh = Ecdh();

    ecdh.private_key <== private_key;
    ecdh.public_key[0] <== public_key[0];
    ecdh.public_key[1] <== public_key[1];

    signal output message[3*3*1*4+4+4+4+3*3*4*8+8+8+8+200*10+10+1];

    component enc = EncryptBits(3*3*1*4+4+4+4+3*3*4*8+8+8+8+200*10+10);
    enc.shared_key <== ecdh.shared_key;

    var idx = 0;

    component conv2d_1 = Conv2D(28,28,1,4,3,1);
    component bn_1 = BatchNormalization2D(26,26,4);
    component poly_1[26][26][4];
    component avg2d_1 = AveragePooling2D(26,26,4,2,2,25);
    component conv2d_2 = Conv2D(13,13,4,8,3,1);
    component bn_2 = BatchNormalization2D(11,11,8);
    component poly_2[11][11][8];
    component avg2d_2 = AveragePooling2D(11,11,8,2,2,25);
    component flatten = Flatten2D(5,5,8);
    component dense = Dense(200,10);
    component argmax = ArgMax(10);

    for (var i=0; i<28; i++) {
        for (var j=0; j<28; j++) {
            conv2d_1.in[i][j][0] <== in[i][j][0];
        }
    }

    for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
            for (var m=0; m<4; m++) {
                conv2d_1.weights[i][j][0][m] <== conv2d_1_weights[i][j][0][m];
                enc.plaintext[idx] <== conv2d_1_weights[i][j][0][m];
                idx++;
            }
        }
    }
    
    for (var m=0; m<4; m++) {
        conv2d_1.bias[m] <== conv2d_1_bias[m];
        enc.plaintext[idx] <== conv2d_1_bias[m];
        idx++;
    }

    for (var k=0; k<4; k++) {
        bn_1.a[k] <== bn_1_a[k];
        enc.plaintext[idx] <== bn_1_a[k];
        idx++;
    }

    for (var k=0; k<4; k++) {
        bn_1.b[k] <== bn_1_b[k];
        enc.plaintext[idx] <== bn_1_b[k];
        idx++;
        for (var i=0; i<26; i++) {
            for (var j=0; j<26; j++) {
                bn_1.in[i][j][k] <== conv2d_1.out[i][j][k];
            }
        }
    }

    for (var i=0; i<26; i++) {
        for (var j=0; j<26; j++) {
            for (var k=0; k<4; k++) {
                poly_1[i][j][k] = Poly(10**6);
                poly_1[i][j][k].in <== bn_1.out[i][j][k];
                avg2d_1.in[i][j][k] <== poly_1[i][j][k].out;
            }
        }
    }

    for (var i=0; i<13; i++) {
        for (var j=0; j<13; j++) {
            for (var k=0; k<4; k++) {
                conv2d_2.in[i][j][k] <== avg2d_1.out[i][j][k];
            }
        }
    }

    for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
            for (var k=0; k<4; k++) {   
                for (var m=0; m<8; m++) {
                    conv2d_2.weights[i][j][k][m] <== conv2d_2_weights[i][j][k][m];
                    enc.plaintext[idx] <== conv2d_2_weights[i][j][k][m];
                    idx++;
                }
            }
        }
    }

    for (var m=0; m<8; m++) {
        conv2d_2.bias[m] <== conv2d_2_bias[m];
        enc.plaintext[idx] <== conv2d_2_bias[m];
        idx++;
    }

    for (var k=0; k<8; k++) {
        bn_2.a[k] <== bn_2_a[k];
        enc.plaintext[idx] <== bn_2_a[k];
        idx++;
    }

    for (var k=0; k<8; k++) {
        bn_2.b[k] <== bn_2_b[k];
        enc.plaintext[idx] <== bn_2_b[k];
        idx++;
        for (var i=0; i<11; i++) {
            for (var j=0; j<11; j++) {
                bn_2.in[i][j][k] <== conv2d_2.out[i][j][k];
            }
        }
    }

    for (var i=0; i<11; i++) {
        for (var j=0; j<11; j++) {
            for (var k=0; k<8; k++) {
                poly_2[i][j][k] = Poly(10**18);
                poly_2[i][j][k].in <== bn_2.out[i][j][k];
                avg2d_2.in[i][j][k] <== poly_2[i][j][k].out;
            }
        }
    }

    for (var i=0; i<5; i++) {
        for (var j=0; j<5; j++) {
            for (var k=0; k<8; k++) {
                flatten.in[i][j][k] <== avg2d_2.out[i][j][k];
            }
        }
    }

    for (var i=0; i<200; i++) {
        dense.in[i] <== flatten.out[i];
        for (var j=0; j<10; j++) {
            dense.weights[i][j] <== dense_weights[i][j];
            enc.plaintext[idx] <== dense_weights[i][j];
            idx++;
        }
    }

    for (var i=0; i<10; i++) {
        dense.bias[i] <== dense_bias[i];
        enc.plaintext[idx] <== dense_bias[i];
        idx++;
    }

    for (var i=0; i<10; i++) {
        argmax.in[i] <== dense.out[i];
    }

    out <== argmax.out;

    for (var i=0; i<3*3*1*4+4+4+4+3*3*4*8+8+8+8+200*10+10+1; i++) {
        message[i] <== enc.out[i];
    }
}

component main = encrypted_mnist_latest();