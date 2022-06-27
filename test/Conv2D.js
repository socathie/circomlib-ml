const chai = require("chai");
const { Console } = require("console");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;



describe("Conv2D layer test", function () {
    this.timeout(100000000);

    it("(5,5,3) -> (3,3,2)", async () => {
        let json = require("../models/conv2D_input.json");
        let OUTPUT = require("../models/conv2D_output.json");

        const circuit = await wasm_tester(path.join(__dirname, "circuits", "Conv2D_test.circom"));
        //await circuit.loadConstraints();
        //assert.equal(circuit.nVars, 618);
        //assert.equal(circuit.constraints.length, 486);

        const weights = [];

        for (var i=0; i<json.weights.length; i++) {
            weights.push(Fr.e(json.weights[i]));
        }

        const INPUT = {
            "in": json.in,
            "weights": weights,
            "bias": ["0","0"]
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));

        for (var i=0; i<3*3*2; i++) {
            assert((witness[i+1]-Fr.e(OUTPUT.out[i]))<Fr.e(5000));
            assert((Fr.e(OUTPUT.out[i])-witness[i+1])<Fr.e(5000));
        }
    });

    it("(10,10,3) -> (3,3,2)", async () => {
        let json = require("../models/conv2D_stride_input.json");
        let OUTPUT = require("../models/conv2D_stride_output.json");

        const circuit = await wasm_tester(path.join(__dirname, "circuits", "Conv2D_stride_test.circom"));
        //await circuit.loadConstraints();
        //assert.equal(circuit.nVars, 618);
        //assert.equal(circuit.constraints.length, 486);

        const weights = [];

        for (var i=0; i<json.weights.length; i++) {
            weights.push(Fr.e(json.weights[i]));
        }

        const INPUT = {
            "in": json.in,
            "weights": weights,
            "bias": ["0","0"]
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));

        for (var i=0; i<3*3*2; i++) {
            assert((witness[i+1]-Fr.e(OUTPUT.out[i]))<Fr.e(5000));
            assert((Fr.e(OUTPUT.out[i])-witness[i+1])<Fr.e(5000));
        }
    });
});