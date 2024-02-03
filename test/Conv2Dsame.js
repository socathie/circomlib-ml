const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;



describe("Conv2Dsame layer test", function () {
    this.timeout(100000000);

    it("(5,5,3) -> (5,5,2)", async () => {
        const INPUT = require("../models/Conv2Dsame_input.json");

        const circuit = await wasm_tester(path.join(__dirname, "circuits", "Conv2Dsame_test.circom"));

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
    });

    it("(10,10,3) -> (4,4,2)", async () => {
        const INPUT = require("../models/Conv2Dsame_stride_input.json");

        const circuit = await wasm_tester(path.join(__dirname, "circuits", "Conv2Dsame_stride_test.circom"));

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
    });
});