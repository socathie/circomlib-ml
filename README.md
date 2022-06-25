# Circom Circuits Library for Machine Learning

Disclaimer: This package is not affiliated with circom, circomlib, or iden3.

## Description

- This repository contains a library of circuit templates.
- You can read more about the circom language in [the circom documentation webpage](https://docs.circom.io/).

## Organisation

This respository contains 5 folders:
- `circuits`: it contains the implementation of different cryptographic primitives in circom language.
- `test`: tests.

## Polynomial activation:
Inspired by [Ali, R. E., So, J., & Avestimehr, A. S. (2020)](https://arxiv.org/abs/2011.05530), `circuit/Poly.circom` has been addded as a template to implement `f(x)=x**2+x` as an alternative activation layer to ReLU. The non-polynomial nature of ReLU activation results in a large number of constraints per layer. By replacing ReLU with the polynomial activation `f(n,x)=x**2+n*x`, the number of constraints drastically decrease with a slight performance tradeoff. A parameter `n` is required when declaring the component to adjust for the scaling of floating-point weights and biases into integers. See below for more information.

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

## TODO:
- add strides parameter to `Conv2D` and `SumPooling2D`