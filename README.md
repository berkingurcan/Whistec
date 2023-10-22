![banner](https://github.com/berkingurcan/Whistec/blob/main/whistecbanner.png?raw=true)
# Whistec

The Whistec is a web3 library designed to facilitate the integration private transactions into web2 applications using zk, expecially payment systems.

It provides customizable and useful package for integrating Aztec with web2 applications.

## Library Components

### WistecTransactionHandler

The Purchase Handler is a crucial component of the Whistec library that facilitates the purchase of claims within the web2 application. It handles the following functions:

- **User Secret Creation**: Allows the user to create a secret on the browser and securely store it for future use.
- **Encryption**: Utilizes the *`encrypt(userSecret, nonce)`* function to generate an encrypted code, which serves as a unique identifier for the user.
- **Proof Export**: Enables the user to export a proof from the browser or local environment for future verification.
- **Send Transaction:** Transaction handler function, whether from contract or native transaction with `sendTransaction(txDetails, encryptedCode)`
Uses Whistec Token's transfer function

```rust
#[aztec(private)]
fn transfer(
   from: AztecAddress,
   to: AztecAddress,
   amount: Field,
   nonce: Field,
   encrypted_code: Field,
) -> Field {
   if (from.address != context.msg_sender()) {
       assert_current_call_valid_authwit(&mut context, from);
   } else {
       assert(nonce == 0, "invalid nonce");
   }

   let amount = SafeU120::new(amount);
   storage.balances.at(from).sub(amount);
   storage.balances.at(to).add(amount);

   let owner = to;
   let owner_key = get_public_key(owner.address);
   let owner_set = storage.public_balances.at(owner.address);
   let array_encrypted_code: [Field; 1] = [encrypted_code];

   emit_encrypted_log(
       &mut context,
       context.this_address(),
       owner_set.storage_slot,
       owner_key,
       array_encrypted_code,
   );
   
   1
}
```

### WistecEventListener

Listening encrypted events decrypts it with application owner key. Emitted from Whistec Token contract:

```rust
emit_encrypted_log(
     &mut context,
     context.this_address(),
     owner_set.storage_slot,
     owner_key,
     array_encrypted_code,
);
```

When `array_encrypted_code is not empty`, triggers `POST` event.

### WistecVerifier

The Verifier component provides an environment for the user to authorizes themselves.

- ****************************Proof Export:**************************** User can create proof by using theis secret and nonce
- **************************************************************************Onchain or Offchain Verification Tools:************************************************************************** Creates verification tools for both scenario
- **Auth Trigger:** When verification occurs, triggers a `POST` request to the backend and provides the user with an authentication token like `JWT` to use the API.


# Instructions

### ***Note: This library is currently in the build phase, not completed, most of the functions are may not working and may not be stable.***

This guide provides instructions on how to run the **Whistec** library as a Rust crate.

## Prerequisites

Before running the Whistec library, ensure that you have the following installed:

- Rust programming language and Cargo package manager. You can install Rust by following the official Rust installation guide: https://www.rust-lang.org/tools/install
- Node.js >= v18
- Install Node.js and npm. You can download and install Node.js from the official website: [Node.js](https://nodejs.org/)
- Docker and Docker Compose (Docker Desktop under WSL2 on windows)
- Install Aztec Sandbox by following the instructions from [here](https://docs.aztec.network/dev_docs/getting_started/sandbox#install-the-sandbox) and run it.
- Install Aztec CLI from [here](https://docs.aztec.network/dev_docs/cli/main#requirements).

## Installation

To install the Whistec library, follow these steps:

1. Open a terminal or command prompt.
2. `git clone https://github.com/berkingurcan/Whistec.git`

Compile circuit:

1. `cd circuits/user && nargo check`
2. `nargo compile`

Install dependencies of sandbox and Aztec CLI:

1. `cd sandbox && yarn`

Compile Whistec Token contract:

1. `cd sandbox/src/contracts`
2. Copy your contract folder path compile it like: 
    
    `aztec-cli compile ./path/to/contracts/whistec_token`
    

In the sandbox folder run `yarn start` to run ***whistec_token*** script.

### Testing

Go to project root and run `cargo test`

Should pass encrypt and send transactions tests.

## Usage

To use the Whistec library in your Rust application, follow these steps:

1. Import the Whistec crate in your Rust file:
    
    ```rust
    use Whistec::handlers::TransactionHandler;
    ```
    
2. Instantiate the WhistecTransactionHandler:
    
    ```rust
    let handler = TransactionHandler {};
    ```
    
3. Use functions provided by the WhistecTransactionHandler to encrypt the to handle user authentication and send transaction.
    
    ```rust
    let hash = handler.encrypt(1, 2);
    
    handler.send_transaction(from, to, hash);
    ```

## Example Library Usage In Application

Suppose we have logo generator application and users should have claims to generate logo.

**1 Claim for 1 Generation**

### Purchase Claim

- User enters the web application without any auth
- User creates secret on the browser and store it somewhere
- On the browser library use *`encrypt(userSecret, nonce)`* function to create *`encryptedCode`* it is used for user identifier.
- Also user exports proof from browser or local env to use it later for verification.
- User Buys Claims with Token or ETH
    
    > Explain here more detailed because it is the Handler Library’s first part.
    > 
    - User sends ETH tx to Application vault(can be contract or account) privately by using Aztec(ask here) with public encryptedCode variables.
    
    ```rust
    tx.send(private purchaseDetails, public encryptedCode)
    ```
    
- Event Listener looking for an event the contract or application vault
    
    ```rust
    - Gets purchase details: Claim Count
    - Gets encryptedCode
    if above vars are not null => trigger POST request to DB
    ```
    
- Backend triggers POST Request like this:
    
    ```rust
    	{
    	  "encryptedCode": "4dc3e64fdef81f4d25764eccc389143f3ab4dd75fcff3d9a7814e9d0f823af36",
    	  "add_claim": 5
    	}
    ```
    

### Use Logo Generator

- User can generate proof again using their secret and nonce or can use generated proof file to proove theirself to use claim
- Or depends on the application also can verify himself with Verifier.sol(or conjugate in Aztec)
- After verification backend triggers POST req which gives auth to user to use their claim.

### Summary of the usage library in an application

The outcomes of using Whistec in the example application above can be summarized as follows:

1. **Anonymous Payment**: Whistec enables users to make payments privately by utilizing Aztec technology. Users can send ETH transactions privately, using encrypted codes as their identifiers. This allows for anonymous payment transactions within the application.
2. **Secure User Authentication**: Whistec provides a UserManager component that manages user authentication and generates unique user IDs. This ensures that each user's claims and interactions with the application are securely identified and managed.

In summary, Whistec enhances the privacy and security of the example application by enabling anonymous payments through zk, ensuring secure and anonymous user authentication, and providing efficient transaction management capabilities.

