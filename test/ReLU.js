const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("ReLU layer test", function () {
    this.timeout(100000000);

    it("3 nodes", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "ReLU_test.circom"));
        //await circuit.loadConstraints();
        //assert.equal(circuit.nVars, 1549);
        //assert.equal(circuit.constraints.length, 1551);

        const INPUT = {
            "in": [Fr.e(-3),"0","3"]
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(0)));
        assert(Fr.eq(Fr.e(witness[2]),Fr.e(0)));
        assert(Fr.eq(Fr.e(witness[3]),Fr.e(3)));
    });
});