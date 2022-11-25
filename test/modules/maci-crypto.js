"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpackPubKey = exports.packPubKey = exports.bigInt2Buffer = exports.SNARK_FIELD_SIZE = exports.NOTHING_UP_MY_SLEEVE_PUBKEY = exports.NOTHING_UP_MY_SLEEVE = exports.formatPrivKeyForBabyJub = exports.unstringifyBigInts = exports.stringifyBigInts = exports.verifySignature = exports.hashLeftRight = exports.hash11 = exports.hash5 = exports.hashOne = exports.sign = exports.decrypt = exports.encrypt = exports.genEcdhSharedKey = exports.genKeypair = exports.genPubKey = exports.genPrivKey = exports.genRandomSalt = void 0;
const assert = require('assert');
const crypto = require("crypto");
const ethers = require("ethers");
const ff = require('ffjavascript');
const createBlakeHash = require('blake-hash');
const circomlib_0_5_1_1 = require("./circomlib-0.5.1");
const stringifyBigInts = ff.utils.stringifyBigInts;
exports.stringifyBigInts = stringifyBigInts;
const unstringifyBigInts = ff.utils.unstringifyBigInts;
exports.unstringifyBigInts = unstringifyBigInts;
const SNARK_FIELD_SIZE = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
exports.SNARK_FIELD_SIZE = SNARK_FIELD_SIZE;
// A nothing-up-my-sleeve zero value
// Should be equal to 8370432830353022751713833565135785980866757267633941821328460903436894336785
const NOTHING_UP_MY_SLEEVE = BigInt(ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Maci')])) % SNARK_FIELD_SIZE;
exports.NOTHING_UP_MY_SLEEVE = NOTHING_UP_MY_SLEEVE;
// The pubkey is the first Pedersen base point from iden3's circomlib
// See https://github.com/iden3/circomlib/blob/d5ed1c3ce4ca137a6b3ca48bec4ac12c1b38957a/src/pedersen_printbases.js
const NOTHING_UP_MY_SLEEVE_PUBKEY = [
    BigInt('10457101036533406547632367118273992217979173478358440826365724437999023779287'),
    BigInt('19824078218392094440610104313265183977899662750282163392862422243483260492317')
];
exports.NOTHING_UP_MY_SLEEVE_PUBKEY = NOTHING_UP_MY_SLEEVE_PUBKEY;
/*
 * Convert a BigInt to a Buffer
 */
const bigInt2Buffer = (i) => {
    let hexStr = i.toString(16);
    while (hexStr.length < 64) {
        hexStr = '0' + hexStr;
    }
    return Buffer.from(hexStr, 'hex');
};
exports.bigInt2Buffer = bigInt2Buffer;
// Hash up to 2 elements
const poseidonT3 = (inputs) => {
    assert(inputs.length === 2);
    return (0, circomlib_0_5_1_1.poseidon)(inputs);
};
// Hash up to 5 elements
const poseidonT6 = (inputs) => {
    assert(inputs.length === 5);
    return (0, circomlib_0_5_1_1.poseidon)(inputs);
};
const hash5 = (elements) => {
    const elementLength = elements.length;
    if (elements.length > 5) {
        throw new Error(`elements length should not greater than 5, got ${elements.length}`);
    }
    const elementsPadded = elements.slice();
    if (elementLength < 5) {
        for (let i = elementLength; i < 5; i++) {
            elementsPadded.push(BigInt(0));
        }
    }
    return poseidonT6(elementsPadded);
};
exports.hash5 = hash5;
/*
 * A convenience function for to use Poseidon to hash a Plaintext with
 * no more than 11 elements
 */
const hash11 = (elements) => {
    const elementLength = elements.length;
    if (elementLength > 11) {
        throw new TypeError(`elements length should not greater than 11, got ${elementLength}`);
    }
    const elementsPadded = elements.slice();
    if (elementLength < 11) {
        for (let i = elementLength; i < 11; i++) {
            elementsPadded.push(BigInt(0));
        }
    }
    return poseidonT3([
        poseidonT3([
            poseidonT6(elementsPadded.slice(0, 5)),
            poseidonT6(elementsPadded.slice(5, 10))
        ]),
        elementsPadded[10]
    ]);
};
exports.hash11 = hash11;
/*
 * Hash a single BigInt with the Poseidon hash function
 */
const hashOne = (preImage) => {
    return poseidonT3([preImage, BigInt(0)]);
};
exports.hashOne = hashOne;
/*
 * Hash two BigInts with the Poseidon hash function
 */
const hashLeftRight = (left, right) => {
    return poseidonT3([left, right]);
};
exports.hashLeftRight = hashLeftRight;
/*
 * Returns a BabyJub-compatible random value. We create it by first generating
 * a random value (initially 256 bits large) modulo the snark field size as
 * described in EIP197. This results in a key size of roughly 253 bits and no
 * more than 254 bits. To prevent modulo bias, we then use this efficient
 * algorithm:
 * http://cvsweb.openbsd.org/cgi-bin/cvsweb/~checkout~/src/lib/libc/crypt/arc4random_uniform.c
 * @return A BabyJub-compatible random value.
 */
const genRandomBabyJubValue = () => {
    // Prevent modulo bias
    //const lim = BigInt('0x10000000000000000000000000000000000000000000000000000000000000000')
    //const min = (lim - SNARK_FIELD_SIZE) % SNARK_FIELD_SIZE
    const min = BigInt('6350874878119819312338956282401532410528162663560392320966563075034087161851');
    let rand;
    while (true) {
        rand = BigInt('0x' + crypto.randomBytes(32).toString('hex'));
        if (rand >= min) {
            break;
        }
    }
    const privKey = rand % SNARK_FIELD_SIZE;
    assert(privKey < SNARK_FIELD_SIZE);
    return privKey;
};
/*
 * @return A BabyJub-compatible private key.
 */
const genPrivKey = () => {
    return genRandomBabyJubValue();
};
exports.genPrivKey = genPrivKey;
/*
 * @return A BabyJub-compatible salt.
 */
const genRandomSalt = () => {
    return genRandomBabyJubValue();
};
exports.genRandomSalt = genRandomSalt;
/*
 * An internal function which formats a random private key to be compatible
 * with the BabyJub curve. This is the format which should be passed into the
 * PublicKey and other circuits.
 */
const formatPrivKeyForBabyJub = (privKey) => {
    const sBuff = circomlib_0_5_1_1.eddsa.pruneBuffer(createBlakeHash("blake512").update(bigInt2Buffer(privKey)).digest().slice(0, 32));
    const s = ff.utils.leBuff2int(sBuff);
    return ff.Scalar.shr(s, 3);
};
exports.formatPrivKeyForBabyJub = formatPrivKeyForBabyJub;
/*
 * Losslessly reduces the size of the representation of a public key
 * @param pubKey The public key to pack
 * @return A packed public key
 */
const packPubKey = (pubKey) => {
    return circomlib_0_5_1_1.babyJub.packPoint(pubKey);
};
exports.packPubKey = packPubKey;
/*
 * Restores the original PubKey from its packed representation
 * @param packed The value to unpack
 * @return The unpacked public key
 */
const unpackPubKey = (packed) => {
    return circomlib_0_5_1_1.babyJub.unpackPoint(packed);
};
exports.unpackPubKey = unpackPubKey;
/*
 * @param privKey A private key generated using genPrivKey()
 * @return A public key associated with the private key
 */
const genPubKey = (privKey) => {
    privKey = BigInt(privKey.toString());
    assert(privKey < SNARK_FIELD_SIZE);
    return circomlib_0_5_1_1.eddsa.prv2pub(bigInt2Buffer(privKey));
};
exports.genPubKey = genPubKey;
const genKeypair = () => {
    const privKey = genPrivKey();
    const pubKey = genPubKey(privKey);
    const Keypair = { privKey, pubKey };
    return Keypair;
};
exports.genKeypair = genKeypair;
/*
 * Generates an Elliptic-curve Diffie–Hellman shared key given a private key
 * and a public key.
 * @return The ECDH shared key.
 */
const genEcdhSharedKey = (privKey, pubKey) => {
    return circomlib_0_5_1_1.babyJub.mulPointEscalar(pubKey, formatPrivKeyForBabyJub(privKey))[0];
};
exports.genEcdhSharedKey = genEcdhSharedKey;
/*
 * Encrypts a plaintext using a given key.
 * @return The ciphertext.
 */
const encrypt = (plaintext, sharedKey) => {
    // Generate the IV
    const iv = circomlib_0_5_1_1.mimc7.multiHash(plaintext, BigInt(0));
    const ciphertext = {
        iv,
        data: plaintext.map((e, i) => {
            return e + circomlib_0_5_1_1.mimc7.hash(sharedKey, iv + BigInt(i));
        }),
    };
    // TODO: add asserts here
    return ciphertext;
};
exports.encrypt = encrypt;
/*
 * Decrypts a ciphertext using a given key.
 * @return The plaintext.
 */
const decrypt = (ciphertext, sharedKey) => {
    const plaintext = ciphertext.data.map((e, i) => {
        return BigInt(e) - BigInt(circomlib_0_5_1_1.mimc7.hash(sharedKey, BigInt(ciphertext.iv) + BigInt(i)));
    });
    return plaintext;
};
exports.decrypt = decrypt;
/*
 * Generates a signature given a private key and plaintext.
 * @return The signature.
 */
const sign = (privKey, msg) => {
    return circomlib_0_5_1_1.eddsa.signPoseidon(bigInt2Buffer(privKey), msg);
};
exports.sign = sign;
/*
 * Checks whether the signature of the given plaintext was created using the
 * private key associated with the given public key.
 * @return True if the signature is valid, and false otherwise.
 */
const verifySignature = (msg, signature, pubKey) => {
    return circomlib_0_5_1_1.eddsa.verifyPoseidon(msg, signature, pubKey);
};
exports.verifySignature = verifySignature;
