const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("MaxPool2D layer test", function () {
    this.timeout(100000000);

    it("kernel_size 2", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "MaxPool2D_test.circom"));

        const INPUT = {
            "in": [["8","0"], [Fr.e(-11), "5"]]
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(8))); 
    });

    it("kernel_size 3", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "MaxPool2D_ks3_test.circom"));

        const INPUT = {
            "in": [["8","0", "9"], [Fr.e(-11), "5", Fr.e(-5)], [Fr.e(-24), "15", "9"]]
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(15))); 
    });
});