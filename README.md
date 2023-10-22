![banner](https://github.com/berkingurcan/Whistec/blob/main/whistecbanner.png?raw=true)
# Whistec

The Whistec is a web3 library designed to facilitate the integration private transactions into web2 applications using zk, expecially payment systems.

It provides customizable and useful package for integrating Aztec with web2 applications.

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

## Library Components

### WistecTransactionHandler

The Purchase Handler is a crucial component of the Whistec library that facilitates the purchase of claims within the web2 application. It handles the following functions:

- **User Secret Creation**: Allows the user to create a secret on the browser and securely store it for future use.
- **Encryption**: Utilizes the *`encrypt(userSecret, nonce)`* function to generate an encrypted code, which serves as a unique identifier for the user.
- **Proof Export**: Enables the user to export a proof from the browser or local environment for future verification.
- **Send Transaction:** Transaction handler function, whether from contract or native transaction with `sendTransaction(txDetails, encryptedCode)`

### WistecEventListener

Listening encrypted events decrypts it with application owner key. 

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
