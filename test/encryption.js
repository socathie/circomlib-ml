const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

const { Keypair } = require("./modules/maci-domainobjs");
const { encrypt, decrypt } = require("./modules/maci-crypto");

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

    it("ecdh shared key test", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "ecdh_test.circom"));

        const keypair = new Keypair();
        const keypair2 = new Keypair();

        const ecdhSharedKey = Keypair.genEcdhSharedKey(
            keypair.privKey,
            keypair2.pubKey,
        );

        const INPUT = {
            'private_key': keypair.privKey.asCircuitInputs(),
            'public_key': keypair2.pubKey.asCircuitInputs(),
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(ecdhSharedKey)));

    });

    it("encrypt/decrypt test", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "encryptDecrypt_test.circom"));

        const keypair = new Keypair();
        const keypair2 = new Keypair();

        const ecdhSharedKey = Keypair.genEcdhSharedKey(
            keypair.privKey,
            keypair2.pubKey,
        );

        const INPUT = {
            'message': '123456789',
            'shared_key': ecdhSharedKey.toString(),
            'private_key': keypair.privKey.asCircuitInputs(),
            'public_key': keypair2.pubKey.asCircuitInputs(),
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(1)));

    });

    it("encrypt in circom, decrypt in js", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "encrypt_test.circom"));

        const keypair = new Keypair();
        const keypair2 = new Keypair();

        const ecdhSharedKey = Keypair.genEcdhSharedKey(
            keypair.privKey,
            keypair2.pubKey,
        );

        const plaintext = 1234567890n;

        const INPUT = {
            'plaintext': plaintext.toString(),
            'shared_key': ecdhSharedKey.toString(),
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        output1 = witness[1];
        output2 = witness[2];

        const ciphertext = {
            iv: output1,
            data: [output2],
        }

        assert(Fr.eq(Fr.e(decrypt(ciphertext, ecdhSharedKey)[0]), Fr.e(plaintext)));
    });

    it("encrypt in js, decrypt in circom", async () => {
        const circuit = await wasm_tester(path.join(__dirname, "circuits", "decrypt_test.circom"));

        const keypair = new Keypair();
        const keypair2 = new Keypair();

        const ecdhSharedKey = Keypair.genEcdhSharedKey(
            keypair.privKey,
            keypair2.pubKey,
        );

        const plaintext = 1234567890n;

        const ciphertext = encrypt([plaintext], ecdhSharedKey);

        const INPUT = {
            'message': [ciphertext.iv.toString(), ciphertext.data[0].toString()],
            'shared_key': ecdhSharedKey.toString(),
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[1]), Fr.e(plaintext)));

    });
    
    // TODO: encrypt multiple
    // TODO: decrypt multiple
});