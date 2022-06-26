const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

const json = require("../models/model1_input.json");
const OUTPUT = require("../models/model1_output.json");

describe("model1 test", function () {
    this.timeout(100000000);

    it("should return correct output", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "model1_test.circom"));
        //await circuit.loadConstraints();
        //assert.equal(circuit.nVars, 1050);
        //assert.equal(circuit.constraints.length, 1042);

        const Dense32weights = [];
        const Dense21weights = []

        for (var i=0; i<json.Dense32weights.length; i++) {
            Dense32weights.push(Fr.e(json.Dense32weights[i]));
        }

        for (var i=0; i<json.Dense21weights.length; i++) {
            Dense21weights.push(Fr.e(json.Dense21weights[i]));
        }

        const INPUT = {
            "in": json.in,
            "Dense32weights": Dense32weights,
            "Dense21weights": Dense21weights
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness[1]);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert((witness[1]-Fr.e(OUTPUT.out[0]))<Fr.e(1000000));
        assert((Fr.e(OUTPUT.out[0])-witness[1])<Fr.e(1000000));
    });
});