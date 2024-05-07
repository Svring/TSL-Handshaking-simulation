export class PreMasterSecret {
    static async deriveSharedSecret(privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> {
        const sharedSecret = await window.crypto.subtle.deriveKey(
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
                public: publicKey,
            },
            privateKey,
            {
                name: "AES-GCM",
                length: 256,
            },
            false,
            ["encrypt", "decrypt"]
        );
        return sharedSecret;
    }
}