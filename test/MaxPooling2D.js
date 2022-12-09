const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;



describe("MaxPooling2D layer test", function () {
    this.timeout(100000000);

    // MaxPooling with strides==poolSize
    it("(5,5,3) -> (2,2,3)", async () => {
        const json = require("../models/maxPooling2D_input.json");
        const OUTPUT = require("../models/maxPooling2D_output.json");

        const circuit = await wasm_tester(path.join(__dirname, "circuits", "MaxPooling2D_test.circom"));
        //await circuit.loadConstraints();
        //assert.equal(circuit.nVars, 76);
        //assert.equal(circuit.constraints.length, 0);

        const INPUT = {
            "in": json.in
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));

        for (var i=0; i<OUTPUT.out.length; i++) {
            assert(Fr.eq(Fr.e(OUTPUT.out[i]),witness[i+1]));
        }
    });

    // MaxPooling with strides!=poolSize
    it("(10,10,3) -> (3,3,3)", async () => {
        const json = require("../models/maxPooling2D_stride_input.json");
        const OUTPUT = require("../models/maxPooling2D_stride_output.json");

        const circuit = await wasm_tester(path.join(__dirname, "circuits", "MaxPooling2D_stride_test.circom"));

        const INPUT = {
            "in": json.in
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));

        for (var i=0; i<OUTPUT.out.length; i++) {
            assert(Fr.eq(Fr.e(OUTPUT.out[i]),witness[i+1]));
        }
    });
});