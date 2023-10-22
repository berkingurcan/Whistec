use light_poseidon::{Poseidon, PoseidonBytesHasher, parameters::bn254_x5};
use ark_bn254::Fr;
use ark_ff::{BigInteger, PrimeField, Field};
use std::process::{Command, exit};

pub struct TransactionHandler {
    // add any necessary fields here
}


impl TransactionHandler {
    pub fn encrypt(&self, user_secret: u32, nonce: u32) -> [u8; 32] {
        // implementation for encryption
        let user_secret_bytes = user_secret.to_be_bytes();
        let nonce_bytes = nonce.to_be_bytes();

        let mut poseidon = Poseidon::<Fr>::new_circom(2).unwrap();
        let hash = poseidon.hash_bytes_be(&[&user_secret_bytes, &nonce_bytes]).unwrap();

        return hash;
    }

    fn export_proof(&self, user_secret: u32, nonce: u32) -> Vec<u8> {
        // implementation for exporting proof
        unimplemented!()
    }

    fn send_transaction(&self, from: &[u8], vault: &[u8]) -> bool {
        // implementation for sending transaction
        
    }
}


fn execute_command(command: &str) {
    let output = Command::new("sh")
        .arg("-c")
        .arg(command)
        .output();

    match output {
        Ok(output) => {
            if output.status.success() {
                if let Ok(stdout) = String::from_utf8(output.stdout) {
                    println!("Command executed successfully:\n{}", stdout);
                }
            } else {
                if let Ok(stderr) = String::from_utf8(output.stderr) {
                    eprintln!("Error executing command:\n{}", stderr);
                }
            }
        },
        Err(err) => {
            eprintln!("Error executing command: {:?}", err);
            exit(1);
        }
    }
}