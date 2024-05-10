'use client'

export class RsaKeyPair {
    static async generateKeyPair(): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey }> {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048, // You can adjust the key size as needed
                publicExponent: new Uint8Array([1, 0, 1]), // Equivalent to 65537
                hash: "SHA-256",
            },
            true, // Whether the key is extractable (i.e., can be used in exportKey)
            ["encrypt", "decrypt"] // Key usages
        );

        console.log('Keys generated and saved.');

        return { publicKey: keyPair.publicKey, privateKey: keyPair.privateKey };
    }
}