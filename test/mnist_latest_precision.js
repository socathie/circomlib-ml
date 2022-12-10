const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

const json = require("../models/mnist_latest_precision_input.json");
const OUTPUT = require("../models/mnist_latest_precision_output.json");

describe("mnist latest optimized test", function () {
    this.timeout(100000000);

    it("should return correct output", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "mnist_latest_precision_test.circom"));
        await circuit.loadConstraints();
        console.log(circuit.nVars, circuit.constraints.length);

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

        //console.log(witness[1]);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(7)));

        let ape = 0;

        for (var i=0; i<OUTPUT.out.length; i++) {
            console.log("actual", OUTPUT.out[i], "predicted", Fr.toString(witness[i+2])*OUTPUT.scale);
            ape += Math.abs((OUTPUT.out[i]-parseInt(Fr.toString(witness[i+2]))*OUTPUT.scale)/OUTPUT.out[i]);
        }

        const mape = ape/OUTPUT.out.length;

        console.log("mean absolute % error", mape);
    });
});