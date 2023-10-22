#[cfg(test)]
mod tests {
    use super::*;
    use hex::*;
    use Whistec::handlers::TransactionHandler;
    use light_poseidon::{Poseidon, PoseidonBytesHasher, parameters::bn254_x5};
    use ark_bn254::Fr;
    use ark_ff::{BigInteger, Field};

    #[test]
    fn test_encrypt() {
        let handler = TransactionHandler {};
        let hash = handler.encrypt(1, 2);
        
        // add assertions here to check the encrypted code
        // encode the hash to a hex string
        let hash_hex = hex::encode(hash);
        println!("encrypted_code {:?}", hash_hex);

        assert!(hash_hex == "115cc0f5e7d690413df64c6b9662e9cf2a3617f2743245519e19607a4417189a");
    }

    #[test]
    fn test_export_proof() {
        unimplemented!()
    }

    #[test]
    fn test_send_transaction() {
        let handler = TransactionHandler {};
        // check if there is error when sending transaction
        handler.send_transaction();
    }
}