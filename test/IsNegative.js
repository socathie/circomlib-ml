const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("IsNegative test", function () {
    this.timeout(100000000);

    it("Negative -> 1", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "IsNegative_test.circom"));
        //await circuit.loadConstraints();
        //assert.equal(circuit.nVars, 516);
        //assert.equal(circuit.constraints.length, 516);

        const INPUT = {
            "in": Fr.e(-1)
        }
        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(1)));
    });

    it("Positive -> 0", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "IsNegative_test.circom"));
        //await circuit.loadConstraints();
        //assert.equal(circuit.nVars, 516);
        //assert.equal(circuit.constraints.length, 516);

        const INPUT = {
            "in": "1"
        }
        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(0)));
    });
});