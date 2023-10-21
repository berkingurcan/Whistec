import { Fr, NotePreimage, computeMessageSecretHash, createDebugLogger, createPXEClient, getSandboxAccountsWallets, waitForSandbox, } from '@aztec/aztec.js';
import { TokenContract } from '@aztec/noir-contracts/types';
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
    const initialSupply = 1000000n;
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
    // Make the tokens spendable by redeeming them using the secret (converts the "pending shield note" created above
    // to a "token note")
    await tokenContractUser.methods.redeem_shield(user, initialSupply, userSecret).send().wait();
    logger(`${initialSupply} tokens were successfully minted and redeemed by User`);
    const tokenContractApp = tokenContractUser.withWallet(accounts[1]);
    let userBalance = await tokenContractUser.methods.balance_of_private(user).view();
    logger(`User's balance ${userBalance}`);
    let appBalance = await tokenContractApp.methods.balance_of_private(appvault).view();
    logger(`App's balance ${appBalance}`);
    async function transferTokens(from, to, amount) {
        const transferQuantity = amount;
        logger(`Transferring ${transferQuantity} tokens from User to App...`);
        await tokenContractUser.methods.transfer(from, to, transferQuantity, 0).send().wait();
        // Check the new balances
        userBalance = await tokenContractUser.methods.balance_of_private(from).view();
        logger(`Users's balance ${userBalance}`);
        appBalance = await tokenContractApp.methods.balance_of_private(to).view();
        logger(`Bob's balance ${appBalance}`);
    }
    transferTokens(user, appvault, 123n);
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVILEVBQUUsRUFDRixZQUFZLEVBRVosd0JBQXdCLEVBQ3hCLGlCQUFpQixFQUNqQixlQUFlLEVBQ2YseUJBQXlCLEVBRXpCLGNBQWMsR0FDakIsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFNUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU5QixNQUFNLEVBQUUsT0FBTyxHQUFHLHVCQUF1QixFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUUxRCxLQUFLLFVBQVUsSUFBSTtJQUNmLGlGQUFpRjtJQUNqRixvREFBb0Q7SUFDcEQsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JDLCtCQUErQjtJQUMvQixNQUFNLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUUxQixNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QyxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUUxQyxNQUFNLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDaEQsTUFBTSxRQUFRLEdBQUcsTUFBTSx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0RCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDdEMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBRTFDLE1BQU0sQ0FBQyw0QkFBNEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMzRCxNQUFN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