const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("Dense layer test", function () {
    this.timeout(100000000);

    it("3 nodes -> 2 nodes", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "Dense_test.circom"));
        //await circuit.loadConstraints();
        //assert.equal(circuit.nVars, 18);
        //assert.equal(circuit.constraints.length, 6);

        const INPUT = {
            "in": ["1","2","3"],
            "weights": [["4","7"],["5","8"],["6","9"]],
            "bias": ["10","11"]
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(1*4+2*5+3*6+10)));
        assert(Fr.eq(Fr.e(witness[2]),Fr.e(1*7+2*8+3*9+11)));
    });
});