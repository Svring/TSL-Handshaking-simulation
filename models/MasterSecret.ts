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

    static async importSeedAsKey(seed: ArrayBuffer): Promise<CryptoKey> {
        const key = await crypto.subtle.importKey(
            "raw", // format
            seed, // keyData
            { name: "PBKDF2" }, // algorithm
            false, // extractable
            ["deriveKey"] // keyUsages
        );

        return key;
    }

    static async deriveSymmetricKey(seedKey: CryptoKey, salt: ArrayBuffer, keyLength: number): Promise<CryptoKey> {
        // Define the PBKDF2 parameters
        const params: Pbkdf2Params = {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000, // Adjust the number of iterations based on your security requirements
            hash: "SHA-256",
        };

        // Define the key algorithm and usages
        const keyAlgorithm: AesKeyAlgorithm = {
            name: "AES-GCM",
            length: keyLength, // e.g., 128, 192, or 256 bits
        };
        const keyUsages: KeyUsage[] = ["encrypt", "decrypt"];

        // Derive the symmetric key from the seed
        const symmetricKey = await crypto.subtle.deriveKey(
            params,
            seedKey,
            keyAlgorithm,
            false, // Whether the derived key is extractable
            keyUsages
        );

        return symmetricKey;
    }

    static async encryptData(key: CryptoKey, data: string): Promise<{ encryptedData: ArrayBuffer, iv: Uint8Array }> {
        const encoder = new TextEncoder();
        const messageUTF8 = encoder.encode(data);

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const algorithm: AesGcmParams = {
            iv,
            name: 'AES-GCM',
        };

        const encryptedData = await window.crypto.subtle.encrypt(
            algorithm,
            key,
            messageUTF8,
        );

        return { encryptedData, iv };
    }

    static async decryptData(key: CryptoKey, encryptedData: ArrayBuffer, iv: Uint8Array): Promise<string> {
        const algorithm: AesGcmParams = {
            iv,
            name: 'AES-GCM',
        };

        const decryptedData = await window.crypto.subtle.decrypt(
            algorithm,
            key,
            encryptedData,
        );

        const decoder = new TextDecoder();
        const decryptedMessage = decoder.decode(decryptedData);

        return decryptedMessage;
    }


    static combineArrayBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
        // Create a new Uint8Array with the combined length of the two buffers
        const combined = new Uint8Array(buffer1.byteLength + buffer2.byteLength);

        // Copy the data from the first buffer into the combined buffer
        combined.set(new Uint8Array(buffer1), 0);

        // Copy the data from the second buffer into the combined buffer, starting after the first buffer's data
        combined.set(new Uint8Array(buffer2), buffer1.byteLength);

        // Return the underlying ArrayBuffer of the combined Uint8Array
        return combined.buffer;
    }
}