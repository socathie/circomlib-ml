const chai = require("chai");
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