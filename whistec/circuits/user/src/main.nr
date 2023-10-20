use dep::std;

fn main(userSecret : Field, nonce: Field, encryptedCode : pub Field) {
    let x = [userSecret, nonce];
    let hash = std::hash::poseidon::bn254::hash_2(x);
    assert(hash == encryptedCode);
}

#[test]
fn test_main() {
    let x = [1, 2];
    let encryptedCode = std::hash::poseidon::bn254::hash_2(x); 
    main(1, 2, encryptedCode);

    // Uncomment to make test fail
    // main(1, 1);
}
