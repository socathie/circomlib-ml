"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivKey = exports.PubKey = exports.Keypair = exports.Message = exports.Command = exports.StateLeaf = void 0;
const assert = require('assert');
const maci_crypto_1 = require("./maci-crypto");
const SERIALIZED_PRIV_KEY_PREFIX = 'macisk.';
class PrivKey {
    constructor(rawPrivKey) {
        this.copy = () => {
            return new PrivKey(BigInt(this.rawPrivKey.toString()));
        };
        this.asCircuitInputs = () => {
            return (0, maci_crypto_1.formatPrivKeyForBabyJub)(this.rawPrivKey).toString();
        };
        this.serialize = () => {
            return SERIALIZED_PRIV_KEY_PREFIX + this.rawPrivKey.toString(16);
        };
        this.rawPrivKey = rawPrivKey;
    }
}
exports.PrivKey = PrivKey;
PrivKey.unserialize = (s) => {
    const x = s.slice(SERIALIZED_PRIV_KEY_PREFIX.length);
    return new PrivKey(BigInt('0x' + x));
};
PrivKey.isValidSerializedPrivKey = (s) => {
    const correctPrefix = s.startsWith(SERIALIZED_PRIV_KEY_PREFIX);
    const x = s.slice(SERIALIZED_PRIV_KEY_PREFIX.length);
    let validValue = false;
    try {
        const value = BigInt('0x' + x);
        validValue = value < maci_crypto_1.SNARK_FIELD_SIZE;
    }
    catch {
        // comment to make linter happy 
    }
    return correctPrefix && validValue;
};
const SERIALIZED_PUB_KEY_PREFIX = 'macipk.';
class PubKey {
    constructor(rawPubKey) {
        this.copy = () => {
            return new PubKey([
                BigInt(this.rawPubKey[0].toString()),
                BigInt(this.rawPubKey[1].toString()),
            ]);
        };
        this.asContractParam = () => {
            return {
                x: this.rawPubKey[0].toString(),
                y: this.rawPubKey[1].toString(),
            };
        };
        this.asCircuitInputs = () => {
            return this.rawPubKey.map((x) => x.toString());
        };
        this.asArray = () => {
            return [
                this.rawPubKey[0],
                this.rawPubKey[1],
            ];
        };
        this.serialize = () => {
            // Blank leaves have pubkey [0, 0], which packPubKey does not support
            if (BigInt(this.rawPubKey[0]) === BigInt(0) &&
                BigInt(this.rawPubKey[1]) === BigInt(0)) {
                return SERIALIZED_PUB_KEY_PREFIX + 'z';
            }
            const packed = (0, maci_crypto_1.packPubKey)(this.rawPubKey).toString('hex');
            return SERIALIZED_PUB_KEY_PREFIX + packed.toString();
        };
        assert(rawPubKey.length === 2);
        assert(rawPubKey[0] < maci_crypto_1.SNARK_FIELD_SIZE);
        assert(rawPubKey[1] < maci_crypto_1.SNARK_FIELD_SIZE);
        this.rawPubKey = rawPubKey;
    }
}
exports.PubKey = PubKey;
PubKey.unserialize = (s) => {
    // Blank leaves have pubkey [0, 0], which packPubKey does not support
    if (s === SERIALIZED_PUB_KEY_PREFIX + 'z') {
        return new PubKey([BigInt(0), BigInt(0)]);
    }
    const len = SERIALIZED_PUB_KEY_PREFIX.length;
    const packed = Buffer.from(s.slice(len), 'hex');
    return new PubKey((0, maci_crypto_1.unpackPubKey)(packed));
};
PubKey.isValidSerializedPubKey = (s) => {
    const correctPrefix = s.startsWith(SERIALIZED_PUB_KEY_PREFIX);
    let validValue = false;
    try {
        PubKey.unserialize(s);
        validValue = true;
    }
    catch {
        // comment to make linter happy
    }
    return correctPrefix && validValue;
};
class Keypair {
    constructor(privKey) {
        this.copy = () => {
            return new Keypair(this.privKey.copy());
        };
        if (privKey) {
            this.privKey = privKey;
            this.pubKey = new PubKey((0, maci_crypto_1.genPubKey)(privKey.rawPrivKey));
        }
        else {
            const rawKeyPair = (0, maci_crypto_1.genKeypair)();
            this.privKey = new PrivKey(rawKeyPair.privKey);
            this.pubKey = new PubKey(rawKeyPair.pubKey);
        }
    }
    static genEcdhSharedKey(privKey, pubKey) {
        return (0, maci_crypto_1.genEcdhSharedKey)(privKey.rawPrivKey, pubKey.rawPubKey);
    }
    equals(keypair) {
        const equalPrivKey = this.privKey.rawPrivKey === keypair.privKey.rawPrivKey;
        const equalPubKey = this.pubKey.rawPubKey[0] === keypair.pubKey.rawPubKey[0] &&
            this.pubKey.rawPubKey[1] === keypair.pubKey.rawPubKey[1];
        // If this assertion fails, something is very wrong and this function
        // should not return anything 
        // XOR is equivalent to: (x && !y) || (!x && y ) 
        const x = (equalPrivKey && equalPubKey);
        const y = (!equalPrivKey && !equalPubKey);
        assert((x && !y) || (!x && y));
        return equalPrivKey;
    }
}
exports.Keypair = Keypair;
/*
 * An encrypted command and signature.
 */
class Message {
    constructor(iv, data) {
        this.asArray = () => {
            return [
                this.iv,
                ...this.data,
            ];
        };
        this.asContractParam = () => {
            return {
                iv: this.iv.toString(),
                data: this.data.map((x) => x.toString()),
            };
        };
        this.asCircuitInputs = () => {
            return this.asArray();
        };
        this.hash = () => {
            return (0, maci_crypto_1.hash11)(this.asArray());
        };
        this.copy = () => {
            return new Message(BigInt(this.iv.toString()), this.data.map((x) => BigInt(x.toString())));
        };
        assert(data.length === 10);
        this.iv = iv;
        this.data = data;
    }
}
exports.Message = Message;
/*
 * A leaf in the state tree, which maps public keys to votes
 */
class StateLeaf {
    constructor(pubKey, voteOptionTreeRoot, voiceCreditBalance, nonce) {
        this.asArray = () => {
            return [
                ...this.pubKey.asArray(),
                this.voteOptionTreeRoot,
                this.voiceCreditBalance,
                this.nonce,
            ];
        };
        this.asCircuitInputs = () => {
            return this.asArray();
        };
        this.hash = () => {
            return (0, maci_crypto_1.hash5)(this.asArray());
        };
        this.serialize = () => {
            const j = {
                pubKey: this.pubKey.serialize(),
                voteOptionTreeRoot: this.voteOptionTreeRoot.toString(16),
                voiceCreditBalance: this.voiceCreditBalance.toString(16),
                nonce: this.nonce.toString(16),
            };
            return Buffer.from(JSON.stringify(j, null, 0), 'utf8').toString('base64');
        };
        this.pubKey = pubKey;
        this.voteOptionTreeRoot = voteOptionTreeRoot;
        this.voiceCreditBalance = voiceCreditBalance;
        // The this is the current nonce. i.e. a user who has published 0 valid
        // command should have this value at 0, and the first command should
        // have a nonce of 1
        this.nonce = nonce;
    }
    copy() {
        return new StateLeaf(this.pubKey.copy(), BigInt(this.voteOptionTreeRoot.toString()), BigInt(this.voiceCreditBalance.toString()), BigInt(this.nonce.toString()));
    }
    static genBlankLeaf(emptyVoteOptionTreeRoot) {
        return new StateLeaf(new PubKey(maci_crypto_1.NOTHING_UP_MY_SLEEVE_PUBKEY), emptyVoteOptionTreeRoot, BigInt(0), BigInt(0));
    }
    static genRandomLeaf() {
        return new StateLeaf(new PubKey(maci_crypto_1.NOTHING_UP_MY_SLEEVE_PUBKEY), (0, maci_crypto_1.genRandomSalt)(), (0, maci_crypto_1.genRandomSalt)(), (0, maci_crypto_1.genRandomSalt)());
    }
}
exports.StateLeaf = StateLeaf;
StateLeaf.unserialize = (serialized) => {
    const j = JSON.parse(Buffer.from(serialized, 'base64').toString('utf8'));
    return new StateLeaf(PubKey.unserialize(j.pubKey), BigInt('0x' + j.voteOptionTreeRoot), BigInt('0x' + j.voiceCreditBalance), BigInt('0x' + j.nonce));
};
/*
 * Unencrypted data whose fields include the user's public key, vote etc.
 */
class Command {
    constructor(stateIndex, newPubKey, voteOptionIndex, newVoteWeight, nonce, salt = (0, maci_crypto_1.genRandomSalt)()) {
        this.copy = () => {
            return new Command(BigInt(this.stateIndex.toString()), this.newPubKey.copy(), BigInt(this.voteOptionIndex.toString()), BigInt(this.newVoteWeight.toString()), BigInt(this.nonce.toString()), BigInt(this.salt.toString()));
        };
        this.asArray = () => {
            return [
                this.stateIndex,
                ...this.newPubKey.asArray(),
                this.voteOptionIndex,
                this.newVoteWeight,
                this.nonce,
                this.salt,
            ];
        };
        /*
         * Check whether this command has deep equivalence to another command
         */
        this.equals = (command) => {
            return this.stateIndex == command.stateIndex &&
                this.newPubKey[0] == command.newPubKey[0] &&
                this.newPubKey[1] == command.newPubKey[1] &&
                this.voteOptionIndex == command.voteOptionIndex &&
                this.newVoteWeight == command.newVoteWeight &&
                this.nonce == command.nonce &&
                this.salt == command.salt;
        };
        this.hash = () => {
            return (0, maci_crypto_1.hash11)(this.asArray());
        };
        /*
         * Signs this command and returns a Signature.
         */
        this.sign = (privKey) => {
            return (0, maci_crypto_1.sign)(privKey.rawPrivKey, this.hash());
        };
        /*
         * Returns true if the given signature is a correct signature of this
         * command and signed by the private key associated with the given public
         * key.
         */
        this.verifySignature = (signature, pubKey) => {
            return (0, maci_crypto_1.verifySignature)(this.hash(), signature, pubKey.rawPubKey);
        };
        /*
         * Encrypts this command along with a signature to produce a Message.
         */
        this.encrypt = (signature, sharedKey) => {
            const plaintext = [
                ...this.asArray(),
                signature.R8[0],
                signature.R8[1],
                signature.S,
            ];
            const ciphertext = (0, maci_crypto_1.encrypt)(plaintext, sharedKey);
            const message = new Message(ciphertext.iv, ciphertext.data);
            return message;
        };
        this.stateIndex = stateIndex;
        this.newPubKey = newPubKey;
        this.voteOptionIndex = voteOptionIndex;
        this.newVoteWeight = newVoteWeight;
        this.nonce = nonce;
        this.salt = salt;
    }
}
exports.Command = Command;
/*
 * Decrypts a Message to produce a Command.
 */
Command.decrypt = (message, sharedKey) => {
    const decrypted = (0, maci_crypto_1.decrypt)(message, sharedKey);
    const command = new Command(decrypted[0], new PubKey([decrypted[1], decrypted[2]]), decrypted[3], decrypted[4], decrypted[5], decrypted[6]);
    const signature = {
        R8: [decrypted[7], decrypted[8]],
        S: decrypted[9],
    };
    return { command, signature };
};
