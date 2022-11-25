const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;
const { Keypair } = require("./modules/maci-domainobjs");

describe("crypto circuits test", function () {
    this.timeout(100000000);

    it("public key test", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "publicKey_test.circom"));

        const keypair = new Keypair();

        const INPUT = {
            'private_key': keypair.privKey.asCircuitInputs(),
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(keypair.pubKey.rawPubKey[0])));
        assert(Fr.eq(Fr.e(witness[2]), Fr.e(keypair.pubKey.rawPubKey[1])));
    });
});