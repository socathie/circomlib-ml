const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;



describe("Conv2D layer test", function () {
    this.timeout(100000000);

    it("(5,5,3) -> (3,3,2)", async () => {
        let json = require("../models/conv2D_input.json");

        const circuit = await wasm_tester(path.join(__dirname, "circuits", "Conv2D_test.circom"));
        
        const INPUT = {
            "in": json.in,
            "weights": json.weights,
            "bias": json.bias,
            "out": json.out,
            "remainder": json.remainder
        };

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
    });

    it("(10,10,3) -> (3,3,2)", async () => {
        let json = require("../models/conv2D_stride_input.json");

        const circuit = await wasm_tester(path.join(__dirname, "circuits", "Conv2D_stride_test.circom"));
        
        const INPUT = {
            "in": json.in,
            "weights": json.weights,
            "bias": json.bias,
            "out": json.out,
            "remainder": json.remainder
        };

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
    });
});