use light_poseidon::{Poseidon, PoseidonBytesHasher, parameters::bn254_x5};
use ark_bn254::Fr;
use ark_ff::{BigInteger, PrimeField, Field};

pub struct TransactionHandler {
    // add any necessary fields here
}


impl TransactionHandler {
    /// Encrypts the user secret and nonce using Poseidon
    /// Takes in the user secret and nonce as u32
    pub fn encrypt(&self, user_secret: u32, nonce: u32) -> [u8; 32] {
        // implementation for encryption
        let user_secret_bytes = user_secret.to_be_bytes();
        let nonce_bytes = nonce.to_be_bytes();

        let mut poseidon = Poseidon::<Fr>::new_circom(2).unwrap();
        let hash = poseidon.hash_bytes_be(&[&user_secret_bytes, &nonce_bytes]).unwrap();

        return hash;
    }

    fn export_proof(&self, data: &[u8]) -> Vec<u8> {
        // implementation for exporting proof
        unimplemented!()
    }

    fn send_transaction(&self, data: &[u8]) -> bool {
        // implementation for sending transaction
        unimplemented!()
    }
}
