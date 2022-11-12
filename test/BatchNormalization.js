const chai = require("chai");
const { Console } = require("console");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;



describe("BatchNormalization layer test", function () {
    this.timeout(100000000);

    it("(5,5,3) -> (5,5,3)", async () => {
        let json = require("../models/batchNormalization_input.json");
        let OUTPUT = require("../models/batchNormalization_output.json");

        const circuit = await wasm_tester(path.join(__dirname, "circuits", "batchNormalization_test.circom"));

        const a = [];
        const b = [];

        for (var i=0; i<json.a.length; i++) {
            a.push(Fr.e(json.a[i]));
            b.push(Fr.e(json.b[i]));
        }

        const INPUT = {
            "in": json.in,
            "a": a,
            "b": b
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));

        for (var i=0; i<5*5*3; i++) {
            assert((witness[i+1]-Fr.e(OUTPUT.out[i]))<Fr.e(1000));
            assert((Fr.e(OUTPUT.out[i])-witness[i+1])<Fr.e(1000));
        }
    });
});