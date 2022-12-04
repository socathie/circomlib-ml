# Circom Circuits Library for Machine Learning

Run `npm run test` to test all `circomlib-ml` circuit templates.

_Disclaimer: This package is not affiliated with circom, circomlib, or iden3._

## Description

- This repository contains a library of circuit templates.
- You can read more about the circom language in [the circom documentation webpage](https://docs.circom.io/).

## Organisation

This respository contains 2 main folders:
- `circuits`: all circom files containing ML templates and relevant util templates
```bash
circuits/
├── ArgMax.circom
├── AveragePooling2D.circom
├── BatchNormalization2D.circom
├── Conv1D.circom
├── Conv2D.circom
├── Dense.circom
├── Flatten2D.circom
├── MaxPooling2D.circom
├── Poly.circom
├── ReLU.circom
├── SumPooling2D.circom
├── circomlib
│   ├── aliascheck.circom
│   ├── babyjub.circom
│   ├── binsum.circom
│   ├── bitify.circom
│   ├── comparators.circom
│   ├── compconstant.circom
│   ├── escalarmulany.circom
│   ├── escalarmulfix.circom
│   ├── mimc.circom
│   ├── montgomery.circom
│   ├── mux3.circom
│   ├── sign.circom
│   └── switcher.circom
├── circomlib-matrix
│   ├── matElemMul.circom
│   ├── matElemSum.circom
│   └── matMul.circom
├── crypto
│   ├── ecdh.circom
│   ├── encrypt.circom
│   └── publickey_derivation.circom
└── util.circom
```
- `test`: containing all test circuits and unit tests
```bash
test/
├── AveragePooling2D.js
├── BatchNormalization.js
├── Conv1D.js
├── Conv2D.js
├── Dense.js
├── Flatten2D.js
├── IsNegative.js
├── IsPositive.js
├── Max.js
├── MaxPooling2D.js
├── ReLU.js
├── SumPooling2D.js
├── circuits
│   ├── AveragePooling2D_stride_test.circom
│   ├── AveragePooling2D_test.circom
│   ├── BatchNormalization_test.circom
│   ├── Conv1D_test.circom
│   ├── Conv2D_stride_test.circom
│   ├── Conv2D_test.circom
│   ├── Dense_test.circom
│   ├── Flatten2D_test.circom
│   ├── IsNegative_test.circom
│   ├── IsPositive_test.circom
│   ├── MaxPooling2D_stride_test.circom
│   ├── MaxPooling2D_test.circom
│   ├── Max_test.circom
│   ├── ReLU_test.circom
│   ├── SumPooling2D_stride_test.circom
│   ├── SumPooling2D_test.circom
│   ├── decryptMultiple_test.circom
│   ├── decrypt_test.circom
│   ├── ecdh_test.circom
│   ├── encryptDecrypt_test.circom
│   ├── encryptMultiple_test.circom
│   ├── encrypt_test.circom
│   ├── encrypted_mnist_latest_test.circom
│   ├── mnist_convnet_test.circom
│   ├── mnist_latest_precision_test.circom
│   ├── mnist_latest_test.circom
│   ├── mnist_poly_test.circom
│   ├── mnist_test.circom
│   ├── model1_test.circom
│   └── publicKey_test.circom
├── encryption.js
├── mnist.js
├── mnist_convnet.js
├── mnist_latest.js
├── mnist_latest_precision.js
├── mnist_poly.js
└── model1.js
```

## Template descriptions:
- `ArgMax.circom`

    `ArgMax(n)` takes an input array of length `n` and returns an output signal correponds to the 0-based position index of the maximum element in the input.

- `AveragePooling2D.circom`

    `AveragePooling2D (nRows, nCols, nChannels, poolSize, strides, scaledInvPoolSize)` takes an `nRow`-by-`nCol`-by-`nChannels` input array and performs average pooling on patches of `poolSize`-by-`poolSize` with step size `strides`. `scaleInvPoolSize` must be computed separately and supplied to the template. For example, a `poolSize` of 2, should have an scale factor of `1/(2*2) = 0.25 --> 25`.

- `BatchNormalization2D.circom`

    `BatchNormalization2D(nRows, nCols, nChannels)` performs Batch Normalization on a 2D input array. To avoid division, parameters in the layer is parametrized into a multiplying factor `a` and constant addition `b`, i.e. `ax+b`, where

    ```python
    a = gamma/(moving_var+epsilon)**.5
    b = beta-gamma*moving_mean/(moving_var+epsilon)**.5
    ```

- `Conv1D.circom`

    1D version of `Conv2D`

- `Conv2D.circom`

    `Conv2D (nRows, nCols, nChannels, nFilters, kernelSize, strides)` performs 2D convolution on an `nRow`-by-`nCol`-by-`nChannels` input array with filters of `kernelSize`-by-`kernelSize` and step size of `strides`. Currently it works only for "valid" padding setting.

- `Dense.circom`

    `Dense (nInputs, nOutputs)` performs simple matrix multiplication on the 1D input array of length `nInputs` and weights then adds biases to the output.

- `Flatten2D.circom`

    `Flatten2D (nRows, nCols, nChannels)` flattens an `nRow`-by-`nCol`-by-`nChannels` input array.

- `MaxPooling2D.circom`

    `MaxPooling2D (nRows, nCols, nChannels, poolSize, strides)`

- `Poly.circom`

    Inspired by [Ali, R. E., So, J., & Avestimehr, A. S. (2020)](https://arxiv.org/abs/2011.05530), the `Poly()` template has been addded as a template to implement `f(x)=x**2+x` as an alternative activation layer to ReLU. The non-polynomial nature of ReLU activation results in a large number of constraints per layer. By replacing ReLU with the polynomial activation `f(n,x)=x**2+n*x`, the number of constraints drastically decrease with a slight performance tradeoff. A parameter `n` is required when declaring the component to adjust for the scaling of floating-point weights and biases into integers. See below for more information.

- `ReLU.circom`

    `ReLU()` takes a single input and performs ReLU activation, i.e. `max(0,x)`. This computation is much more expensive than `Poly()`. It's recommended to adapt your activation layers into polynomial activation to reduce the size of the final circuit.

- `SumPooling2D.circom`

    Essentially `AveragePooling2D` with a constant scaling of `poolSize*poolSize`. This is preferred in circom to preserve precision and reduce computation.

## Weights and biases scaling:
- Circom only accepts integers as signals, but Tensorflow weights and biases are floating-point numbers.
- In order to simulate a neural network in Circom, weights must be scaled up by `10**m` times. The larger `m` is, the higher the precision.
- Subsequently, biases (if any) must be scaled up by `10**2m` times or even more to maintain the correct output of the network.

An example is provided below.

## Scaling example: `mnist_poly`
In `models/mnist_poly.ipynb`, a sample model of Conv2d-Poly-Dense layers was trained on the [MNIST](https://paperswithcode.com/dataset/mnist) dataset. After training, the weights and biases must be properly scaled before inputting into the circuit:
- Pixel values ranged from 0 to 255. In order for the polynomial activation approximation to work, these input values were scaled to 0.000 to 0.255 during model training. But the original integer values were scaled by `10**6` times as input to the circuit
    - Overall scaled by `10**9` times
- Weights in the `Conv2d` layer were scaled by `10**9` times for higher precision. Subsequently, biases in the same layer must be scaled by `(10**9)*(10**9)=10**18` times.
- The linear term in the polynomial activation layer would also need to be adjusted by `10**18` times in order to match the scaling of the quadratic term. Hence we performed the acitvation with `f(x)=x**2+(10**18)*x`.
- Weights in the `Dense` layer were scaled by `10**9` time for precision again.
- Biases in the `Dense` layer had been omitted for simplcity, since `ArgMax` layer is not affected by the biases. However, if the biases were to be included (for example in a deeper network as an intermediate layer), they would have to be scaled by `(10**9)**5=10**45` times to adjust correctly.

We can easily see that a deeper network would have to sacrifice precision, due to the limitation that Circom works under a finite field of modulo `p` which is around 254 bits. As `log(2**254)~76`, we need to make sure total scaling do not aggregate to exceed `10**76` (or even less) times. On average, a network with `l` layers should be scaled by less than or equal to `10**(76//l)` times.