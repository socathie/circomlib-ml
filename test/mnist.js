const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

const json = require("../models/mnist_input.json");
const OUTPUT = require("../models/mnist_output.json");

describe("mnist test", function () {
    this.timeout(100000000);

    it("should return correct output", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "mnist_test.circom"));
        //await circuit.loadConstraints();
        //assert.equal(circuit.nVars, 371086);
        //assert.equal(circuit.constraints.length, 364883);

        const conv2d_weights = [];
        const conv2d_bias = [];
        const dense_weights = [];
        const dense_bias = [];

        for (var i=0; i<json.conv2d_weights.length; i++) {
            conv2d_weights.push(Fr.e(json.conv2d_weights[i]));
        }
        
        for (var i=0; i<json.conv2d_bias.length; i++) {
            conv2d_bias.push(Fr.e(json.conv2d_bias[i]));
        }
        
        for (var i=0; i<json.dense_weights.length; i++) {
            dense_weights.push(Fr.e(json.dense_weights[i]));
        }

        for (var i=0; i<json.dense_bias.length; i++) {
            dense_bias.push(Fr.e(json.dense_bias[i]));
        }

        const INPUT = {
            "in": json.in,
            "conv2d_weights": conv2d_weights,
            "conv2d_bias": conv2d_bias,
            "dense_weights": dense_weights,
            "dense_bias": dense_bias
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness[1]);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(7)));

        let ape = 0;

        for (var i=0; i<OUTPUT.out.length; i++) {
            console.log("actual", OUTPUT.out[i], "predicted", Fr.toString(witness[i+2])*OUTPUT.scale);
            ape += Math.abs((OUTPUT.out[i]-parseInt(Fr.toString(witness[i+2]))*OUTPUT.scale)/OUTPUT.out[i]);
        }

        const mape = ape/OUTPUT.out.length;

        console.log("mean absolute % error", mape);
    });
});