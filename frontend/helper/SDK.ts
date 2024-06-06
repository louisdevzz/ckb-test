import { defaultEmptyWitnessArgs, updateWitnessArgs, isScriptValueEquals, getSporeConfig } from '@spore-sdk/core';
import { hd, helpers, RPC, Address, Hash, Script, HexString, BI, Cell } from '@ckb-lumos/lumos';
import { secp256k1Blake160 } from '@ckb-lumos/lumos/common-scripts';
import { createSpore,bytifyRawString } from '@spore-sdk/core';
import offckb from "@/offckb.config";
const { indexer, lumosConfig, rpc } = offckb;
offckb.initializeLumosConfig();
export interface Wallet {
  lock: Script;
  address: Address;
  signMessage(message: HexString): Hash;
  signTransaction(txSkeleton: helpers.TransactionSkeletonType): helpers.TransactionSkeletonType;
  signAndSendTransaction(txSkeleton: helpers.TransactionSkeletonType): Promise<Hash>;
}

type Account = {
  lockScript: Script;
  address: Address;
  pubKey: string;
};
/**
 * Create a CKB Default Lock (Secp256k1Blake160 Sign-all) Wallet by a private-key and a SporeConfig,
 * providing lock/address, and functions to sign message/transaction and send the transaction on-chain.
 */
export function createDefaultLockWallet(privateKey: HexString): Wallet {
  const config = getSporeConfig();

  // Generate a lock script from the private key
  const defaultLock = config.lumos.SCRIPTS.SECP256K1_BLAKE160!;
  const lock: Script = {
    codeHash: defaultLock.CODE_HASH,
    hashType: defaultLock.HASH_TYPE,
    args: hd.key.privateKeyToBlake160(privateKey),
  };

  // Generate address from the lock script
  const address = helpers.encodeToAddress(lock, {
    config: config.lumos,
  });
  // Sign for a message
  function signMessage(message: HexString): Hash {
    return hd.key.signRecoverable(message, privateKey);
  }

  // Sign prepared signing entries,
  // and then fill signatures into Transaction.witnesses
  function signTransaction(txSkeleton: helpers.TransactionSkeletonType): helpers.TransactionSkeletonType {
    const signingEntries = txSkeleton.get('signingEntries');
    const signatures = new Map<HexString, Hash>();
    const inputs = txSkeleton.get('inputs');

    let witnesses = txSkeleton.get('witnesses');
    for (let i = 0; i < signingEntries.size; i++) {
      const entry = signingEntries.get(i)!;
      if (entry.type === 'witness_args_lock') {
        // Skip if the input's lock does not match to the wallet's lock
        const input = inputs.get(entry.index);
        if (!input || !isScriptValueEquals(input.cellOutput.lock, lock)) {
          continue;
        }

        // Sign message
        if (!signatures.has(entry.message)) {
          const sig = signMessage(entry.message);
          signatures.set(entry.message, sig);
        }

        // Update signature to Transaction.witnesses
        const signature = signatures.get(entry.message)!;
        const witness = witnesses.get(entry.index, defaultEmptyWitnessArgs);
        witnesses = witnesses.set(entry.index, updateWitnessArgs(witness, 'lock', signature));
      }
    }

    return txSkeleton.set('witnesses', witnesses);
  }

  // Sign the transaction and send it via RPC
  async function signAndSendTransaction(txSkeleton: helpers.TransactionSkeletonType): Promise<Hash> {
    // 1. Sign transaction
    txSkeleton = secp256k1Blake160.prepareSigningEntries(txSkeleton, { config: config.lumos });
    txSkeleton = signTransaction(txSkeleton);

    // 2. Convert TransactionSkeleton to Transaction
    const tx = helpers.createTransactionFromSkeleton(txSkeleton);

    // 3. Send transaction
    const rpc = new RPC(config.ckbNodeUrl);
    return await rpc.sendTransaction(tx, 'passthrough');
  }

  return {
    lock,
    address,
    signMessage,
    signTransaction,
    signAndSendTransaction,
  };
}
export const generateAccountFromPrivateKey = (privKey: string): Account => {
  const pubKey = hd.key.privateToPublic(privKey);
  const args = hd.key.publicKeyToBlake160(pubKey);
  const template = offckb.lumosConfig.SCRIPTS["SECP256K1_BLAKE160"]!;
  const lockScript = {
    codeHash: template.CODE_HASH,
    hashType: template.HASH_TYPE,
    args: args,
  };
  const address = helpers.encodeToAddress(lockScript, { config: offckb.lumosConfig });
  return {
    lockScript,
    address,
    pubKey,
  };
};

export async function capacityOf(address: string): Promise<BI> {
  const collector = indexer.collector({
    lock: helpers.parseAddress(address, { config: lumosConfig }),
  });

  let balance = BI.from(0);
  for await (const cell of collector.collect()) {
    balance = balance.add(cell.cellOutput.capacity);
  }

  return balance;
}

export async function createSpores(wallet:any,content:any) {
  const { txSkeleton, outputIndex } = await createSpore({
    data: {
      contentType: 'application/json',
      content: bytifyRawString(JSON.stringify(content)),
    },
    toLock: wallet.lock,
    fromInfos: [wallet.address],
  });

  const hash = await wallet.signAndSendTransaction(txSkeleton);
  return [outputIndex,txSkeleton,hash];
}
export async function CallTransaction(onChainData:any) {
  const fromScript = helpers.parseAddress("ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqfyt8scj7ajk6ggc6nw6pdmg5dxfqnafaq3d3tmv", {
    config: offckb.lumosConfig,
  });
  const messageOutput: Cell = {
    cellOutput: {
      lock: fromScript,
      capacity: "0x0",
    },
    data: onChainData,
  };
  const minimalCapacity = helpers.minimalCellCapacity(messageOutput);
  messageOutput.cellOutput.capacity = BI.from(minimalCapacity).toHexString();
  const neededCapacity = BI.from(minimalCapacity).add(100000);
  
  
  let collectedSum = BI.from(0);
  const collected: Cell[] = [];
  const collector = indexer.collector({ lock: fromScript, type: "empty" });
  for await (const cell of collector.collect()) {
    collectedSum = collectedSum.add(cell.cellOutput.capacity);
    collected.push(cell);
    if (collectedSum.gte(neededCapacity)) break;
  }
}