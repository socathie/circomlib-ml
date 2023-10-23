const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

const INPUT = require("../models/model1_input.json");

describe("model1 test", function () {
    this.timeout(100000000);

    it("should return correct output", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "model1_test.circom"));

        // const INPUT = {
        //     "in": json.in,
        //     "Dense32weights": json.Dense32weights,
        //     "Dense32bias": json.Dense32bias,
        //     "Dense32out": json.Dense32out,
        //     "Dense32remainder": json.Dense32remainder,
        //     "ReLUout": json.ReLUout,
        //     "Dense21weights": json.Dense21weights,
        //     "Dense21bias": json.Dense21bias,
        //     "Dense21out": json.Dense21out,
        //     "Dense21remainder": json.Dense21remainder,
        // }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(witness[1],Fr.e(INPUT.Dense21out[0])));
    });
});