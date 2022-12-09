const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

const json = require("../models/conv1D_input.json");
const OUTPUT = require("../models/conv1D_output.json");

describe("Conv1D layer test", function () {
    this.timeout(100000000);

    it("(20,3) -> (6,2)", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "Conv1D_test.circom"));
        //await circuit.loadConstraints();
        //assert.equal(circuit.nVars, 618);
        //assert.equal(circuit.constraints.length, 486);

        let INPUT = {};

        for (const [key, value] of Object.entries(json)) {
            if (Array.isArray(value)) {
                let tmpArray = [];
                for (let i = 0; i < value.flat().length; i++) {
                    tmpArray.push(Fr.e(value.flat()[i]));
                }
                INPUT[key] = tmpArray;
            } else {
                INPUT[key] = Fr.e(value);
            }
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));

        let ape = 0;

        for (var i=0; i<OUTPUT.out.length; i++) {
            // console.log("actual", OUTPUT.out[i], "predicted", Fr.toString(witness[i+1]));
            ape += Math.abs((OUTPUT.out[i]-parseInt(Fr.toString(witness[i+1])))/OUTPUT.out[i]);
        }

        const mape = ape/OUTPUT.out.length;

        console.log("mean absolute % error", mape);

        assert(mape < 0.01);
    });
});