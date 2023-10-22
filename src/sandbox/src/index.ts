import {
    AztecAddressLike,
    Fr,
    NotePreimage,
    PXE,
    computeMessageSecretHash,
    createDebugLogger,
    createPXEClient,
    getSandboxAccountsWallets,
    getSchnorrAccount,
    waitForSandbox,
} from '@aztec/aztec.js';
import { GrumpkinScalar } from '@aztec/circuits.js';
import { TokenContract } from './whistec-token.js'

import { format } from 'util';

const { PXE_URL = 'http://localhost:8080' } = process.env;

async function main() {
    ////////////// CREATE THE CLIENT INTERFACE AND CONTACT THE SANDBOX //////////////
    // We create PXE client connected to the sandbox URL
    const pxe = createPXEClient(PXE_URL);
    // Wait for sandbox to be ready
    await waitForSandbox(pxe);

    const nodeInfo = await pxe.getNodeInfo();
    const logger = createDebugLogger('token');

    logger(format('Aztec Sandbox Info ', nodeInfo));
    const accounts = await getSandboxAccountsWallets(pxe);
    const user = accounts[0].getAddress();
    const appvault = accounts[1].getAddress();

    logger(`Loaded user's account at ${user.toShortString()}`);
    logger(`Loaded appvault's account at ${appvault.toShortString()}`);

    ////////////// DEPLOY OUR TOKEN CONTRACT //////////////

    const initialSupply = 1_000_000n;
    logger(`Deploying token contract...`);

    // Deploy the contract and set Alice as the admin while doing so
    const contract = await TokenContract.deploy(pxe, user).send().deployed();
    logger(`Contract successfully deployed at address ${contract.address.toShortString()}`);

    // Create the contract abstraction and link it to Alice's wallet for future signing
    const tokenContractUser = await TokenContract.at(contract.address, accounts[0]);

    // Create a secret and a corresponding hash that will be used to mint funds privately
    const userSecret = Fr.random();
    const userSecretHash = await computeMessageSecretHash(userSecret);

    logger(`Minting tokens to USER...`);
    // Mint the initial supply privately "to secret hash"
    const receipt = await tokenContractUser.methods.mint_private(initialSupply, userSecretHash).send().wait();

    // Add the newly created "pending shield" note to PXE
    const pendingShieldsStorageSlot = new Fr(5); // The storage slot of `pending_shields` is 5.
    const preimage = new NotePreimage([new Fr(initialSupply), userSecretHash]);
    await pxe.addNote(user, contract.address, pendingShieldsStorageSlot, preimage, receipt.txHash);

    await tokenContractUser.methods.redeem_shield(user, initialSupply, userSecret).send().wait();
    logger(`${initialSupply} tokens were successfully minted and redeemed by User`);

    const tokenContractApp = tokenContractUser.withWallet(accounts[1]);

    let userBalance = await tokenContractUser.methods.balance_of_private(user).view();
    logger(`User's balance ${userBalance}`);

    let appBalance = await tokenContractApp.methods.balance_of_private(appvault).view();
    logger(`App's balance ${appBalance}`);

    async function transferTokens(from: AztecAddressLike, to: AztecAddressLike, amount: bigint, encryptedCode = Fr.random()) {
        const transferQuantity = amount;
        logger(`Transferring ${transferQuantity} tokens from User to App...`);
        await tokenContractUser.methods.transfer(from, to, transferQuantity, 0, encryptedCode).send().wait();

        // Check the new balances
        userBalance = await tokenContractUser.methods.balance_of_private(from).view();
        logger(`Users's balance ${userBalance}`);

        appBalance = await tokenContractApp.methods.balance_of_private(to).view();
        logger(`Bob's balance ${appBalance}`);
    }

    transferTokens(user, appvault, 123n);
}
  
main();