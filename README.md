# Circom Circuits Library for Machine Learning

Disclaimer: This package is not affiliated with circom, circomlib, or iden3.

## Description

- This repository contains a library of circuit templates.
- You can read more about the circom language in [the circom documentation webpage](https://docs.circom.io/).

## Organisation

This respository contains 5 folders:
- `circuits`: it contains the implementation of different cryptographic primitives in circom language.
- `test`: tests.

A description of the specific circuit templates for the `circuit` folder will be soon updated.

## Circuits to be added:
* argmax
* pooling

## Remark:
Weights in `model1.js` and `Conv2D.js` are scaled by 1,000 times and rounded since Circom only accept integer signals. Subsequently, biases (if any) need to be scaled up by 1,000,000 times.