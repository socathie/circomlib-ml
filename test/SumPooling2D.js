const chai = require("chai");
const { Console } = require("console");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

const json = require("../models/sumPooling2D_input.json");
const OUTPUT = require("../models/sumPooling2D_output.json");

describe("SumPooling2D layer test", function () {
    this.timeout(100000000);

    it("(5,5,3) -> (2,2,3)", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "SumPooling2D_test.circom"));
        //await circuit.loadConstraints();
        //assert.equal(circuit.nVars, 76);
        //assert.equal(circuit.constraints.length, 0);

        const INPUT = {
            "in": json.in
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));

        for (var i=0; i<2*2*3; i++) {
            assert((witness[i+1]-Fr.e(OUTPUT.out[i]))<Fr.e(2));
            assert((Fr.e(OUTPUT.out[i])-witness[i+1])<Fr.e(2));
        }
    });
});