'use client'

export class RsaKeyPair {
    private publicKey: CryptoKey | null = null;
    private privateKey: CryptoKey | null = null;

    constructor() { }

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

    async encrypt(data: string): Promise<string> {
        if (!this.publicKey) {
            throw new Error('Public key is not available');
        }

        const encodedData = new TextEncoder().encode(data);
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            this.publicKey, // publicKey from generateKeyPair
            encodedData
        );

        // Convert Uint8Array to number[] before converting to string
        const encryptedArray = Array.from(new Uint8Array(encrypted));
        return btoa(String.fromCharCode(...encryptedArray));
    }


    async decrypt(encryptedData: string): Promise<string> {
        if (!this.privateKey) {
            throw new Error('Private key is not available');
        }

        const encryptedDataUint8 = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
            },
            this.privateKey, // privateKey from generateKeyPair
            encryptedDataUint8
        );

        return new TextDecoder().decode(decrypted);
    }
}