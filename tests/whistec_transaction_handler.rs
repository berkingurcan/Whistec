#[cfg(test)]
mod tests {
    use super::*;
    use Whistec::handlers::TransactionHandler;
    use light_poseidon::{Poseidon, PoseidonBytesHasher, parameters::bn254_x5};
    use ark_bn254::Fr;
    use ark_ff::{BigInteger, Field};

    #[test]
    fn test_encrypt() {
        let handler = TransactionHandler {};
        let hash = handler.encrypt(1, 2);
        
        // add assertions here to check the encrypted code
        println!("encrypted_code {:?}", hash);
        assert!(false);
    }

    #[test]
    fn test_export_proof() {
        unimplemented!()
    }

    #[test]
    fn test_send_transaction() {
        unimplemented!()
    }
}