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

    static async generatePremasterSecret(): Promise<ArrayBuffer> {
        // Generate a random value suitable for cryptographic use
        const preMasterSecret = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256, // Length of the key in bits
            },
            true, // Whether the key is extractable (i.e., can be used in exportKey)
            ["encrypt", "decrypt"] // Can be used for encryption and decryption
        );

        // Extract the raw key material
        const rawKeyMaterial = await window.crypto.subtle.exportKey("raw", preMasterSecret);

        // The raw key material is an ArrayBuffer, which can be used as the pre-master secret
        return rawKeyMaterial;
    }

    static async prf(preMasterKey: ArrayBuffer, label: string, random: ArrayBuffer): Promise<ArrayBuffer> {
        // Convert the label to an ArrayBuffer
        const labelBuffer = new TextEncoder().encode(label);

        // Concatenate the pre-master key, label, and random value
        const input = new Uint8Array(preMasterKey.byteLength + labelBuffer.byteLength + random.byteLength);
        input.set(new Uint8Array(preMasterKey), 0);
        input.set(labelBuffer, preMasterKey.byteLength);
        input.set(new Uint8Array(random), preMasterKey.byteLength + labelBuffer.byteLength);

        // Import the pre-master key as a CryptoKey object
        const key = await crypto.subtle.importKey(
            "raw",
            preMasterKey,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );

        // Sign the input with the HMAC key to generate the pseudorandom output
        const signature = await crypto.subtle.sign("HMAC", key, input);

        return signature;
    }
}