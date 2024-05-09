'use client'

import { Card, Group, Input } from "@mantine/core";
import { useState, useEffect, Dispatch } from "react";
import { Ciphersuite } from "@/models/ciphersuite";
import { RsaKeyPair } from "@/models/RsaKeyPair";
import { Certificate } from "@/models/Certificate";
import {
    TlsServerCertificate, TlsClientHello,
    TlsServerHello, TlsServerHelloDone, TlsClientKeyExchange,
    TlsChangeCipherSpec, TlsFinished
} from "@/models/handshake";

import CA from "../CA/CA";
import CipherSuite from "../CipherSuite/CipherSuite";
import PublicKey from "../PublicKey/PublicKey";
import PrivateKey from "../PrivateKey/PrivateKey";
import CertificateComponent from "../Certificate/Certificate";
import Random from "../Random/Random";
import PreMaster from "../PreMaster/PreMaster";
import Master from "../Master/Master";
import SelectedSuite from "../SelectedSuite/SelectedSuite";
import { PreMasterSecret } from '../../models/MasterSecret';

export default function Client({ clock, message, setMessage }:
    { clock: number, message: any, setMessage: Dispatch<any> }) {

    const [data, setData] = useState<string>('');
    const [ca, setCa] = useState<TlsServerCertificate[]>(Certificate.certificateAuthority);
    const [ciphersuite, setCiphersuite] = useState<string[]>(Ciphersuite.cipherSuites);
    const [publicKey, setPublicKey] = useState<CryptoKey>();
    const [privateKey, setPrivateKey] = useState<CryptoKey>();
    const [random, setRandom] = useState<ArrayBuffer>(Buffer.from(''));
    const [serverRandom, setServerRandom] = useState<ArrayBuffer>();
    const [serverPublic, setServerPublic] = useState<JsonWebKey>();
    const [certificate, setCertificate] = useState<TlsServerCertificate>();
    const [preMaster, setPreMaster] = useState<ArrayBuffer>(Buffer.from(''));
    const [master, setMaster] = useState<ArrayBuffer>(Buffer.from(''));
    const [secret, setSecret] = useState<CryptoKey>();

    useEffect(() => {
        generateRandom();
    }, []);

    useEffect(() => {
        if (clock === 0) {
            console.log("Client: Client Reset.");
        }
        if (clock === 1) {
            console.log("Client: Clock equals 1, client hello initiated.");
            const clientHelloTemp = clientHello();

            setMessage(clientHelloTemp);
            console.log("Client: Client Hello Done, message shown below.");
            console.log(clientHelloTemp);
        }
        if (clock === 3) {
            console.log("Client: Clock equals 3, server's message shown below.");
            console.log(message);

            console.log("Client: Client Key Exchange Initiated.");
            // const clientKeyExchangeTemp = clientKeyExchange(message);
            clientKeyExchange(message).then(data => {
                const clientKeyExchangeTemp = data;

                console.log("Client: Client ChangeCipherSpec Initiated.");
                const changeCipherSpecTemp = changeCipherSpec();

                console.log("Client: Client Finished Initiated.");
                const clientFinishedTemp = clientFinished();

                const messageTemp = {
                    clientKeyExchange: clientKeyExchangeTemp,
                    changeCipherSpec: changeCipherSpecTemp,
                    clientFinished: clientFinishedTemp
                };
                setMessage(messageTemp);
                console.log("Client: Client Finished Done, message shown below.");
                console.log(messageTemp);
            });
        }
        if (clock === 5) {
            computeMasterSecret();
            console.log("Client: Clock equals 5, Application Data Delivery Initiated.");
        }
    }, [clock]);

    function generateRandom() {
        const clientRandom = new Uint8Array(32);
        // Fill the array with cryptographically strong random values
        window.crypto.getRandomValues(clientRandom);
        // Return the generated random value
        setRandom(clientRandom);
    }

    function generateKeyPair() {
        RsaKeyPair.generateKeyPair()
            .then(({ publicKey, privateKey }) => {
                setPublicKey(publicKey);
                setPrivateKey(privateKey);
                // window.crypto.subtle.exportKey('jwk', publicKey)
                //     .then(jwk => {
                //         setPublicKey(jwk)
                //     })
                // window.crypto.subtle.exportKey('jwk', privateKey)
                //     .then(jwk => {
                //         setPrivateKey(jwk)
                //     })
            })
            .catch(err => console.log(err));
    }

    function clientHello(): TlsClientHello {
        const temp = {
            tlsVersion: 'TLSv1.2',
            cipherSuites: ciphersuite,
            random: random, // 示例随机字节
            extensions: {
                serverName: 'example.com', // SNI扩展示例
                maxFragmentLength: 2048, // 最大片段长度扩展示例
            },
        }
        return temp;
    }

    async function clientKeyExchange(message: any): Promise<TlsClientKeyExchange | void> {
        const certificate: TlsServerCertificate = message.serverCertificate;
        if (ca.includes(certificate)) {
            console.log("Client: Server Certificate is valid.");
            setCertificate(certificate);
        }

        if (message.serverHello.random) {
            console.log("Client: Server Random Exists as Shown Below.");
            setServerRandom(message.serverHello.random);
        }

        const serverPublicKey = message.serverPublicKey;
        console.log("Client: Server Public Key As Below.");
        setServerPublic(serverPublicKey);

        try {
            const preMaster = await PreMasterSecret.generatePremasterSecret();
            console.log("Client: PreMasterSecret Generated As Below.");
            console.log(preMaster);
            setPreMaster(preMaster);

            const publicKey = await window.crypto.subtle.importKey('jwk', serverPublicKey,
                { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
            console.log("Client: Server Public Key Imported As Below.");
            console.log(publicKey);

            const encryptedPreMaster = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, preMaster);
            console.log("Client: Encrypted PreMasterSecret As Below.");
            console.log(encryptedPreMaster);

            return { preMasterSecret: encryptedPreMaster };
        } catch (err) {
            console.error("Error during encryption:", err);
        }
    }

    function computeMasterSecret() {
        console.log("Client: Master Secret computation initiated.");

        if (serverRandom) {
            PreMasterSecret.prf(preMaster, 'master secret', combineArrayBuffers(random, serverRandom))
                .then(masterSecret => {
                    console.log("Client: Master Secret Computed As Below.");
                    console.log(masterSecret);
                    setMaster(masterSecret);

                    importSeedAsKey(masterSecret)
                        .then(key => {
                            deriveSymmetricKey(key, combineArrayBuffers(random, serverRandom), 256)
                                .then(secret => {
                                    console.log("Client: Secret Key Computed As Below.");
                                    console.log(secret);
                                    setSecret(secret);

                                    console.log(`Client: Data delivered is ${data}`);
                                    encryptData(secret, data)
                                        .then(result => {
                                            setMessage(result);
                                        })
                                })
                        })
                })
        }
    }

    async function importSeedAsKey(seed: ArrayBuffer): Promise<CryptoKey> {
        const key = await crypto.subtle.importKey(
            "raw", // format
            seed, // keyData
            { name: "PBKDF2" }, // algorithm
            false, // extractable
            ["deriveKey"] // keyUsages
        );

        return key;
    }

    async function deriveSymmetricKey(seedKey: CryptoKey, salt: ArrayBuffer, keyLength: number): Promise<CryptoKey> {
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

    async function encryptData(key: CryptoKey, data: string): Promise<{encryptedData: ArrayBuffer, iv: Uint8Array}> {
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

        return {encryptedData, iv};
    }

    async function decryptData(key: CryptoKey, encryptedData: ArrayBuffer, iv: Uint8Array): Promise<string> {
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


    function combineArrayBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
        // Create a new Uint8Array with the combined length of the two buffers
        const combined = new Uint8Array(buffer1.byteLength + buffer2.byteLength);

        // Copy the data from the first buffer into the combined buffer
        combined.set(new Uint8Array(buffer1), 0);

        // Copy the data from the second buffer into the combined buffer, starting after the first buffer's data
        combined.set(new Uint8Array(buffer2), buffer1.byteLength);

        // Return the underlying ArrayBuffer of the combined Uint8Array
        return combined.buffer;
    }

    function changeCipherSpec(): TlsChangeCipherSpec {
        return {
            messageType: 'changeCipherSpec'
        }
    }

    function clientFinished(): TlsFinished {
        return {
            messageType: 'finished',
            verifyData: Buffer.from('')
        }
    }

    return (
        <Card shadow="sm" p="md" bg={'#151d23'} w={'25vw'} radius={'1rem'} withBorder >
            <Card.Section>

            </Card.Section>

            <CA ca={ca} />

            <CipherSuite />

            <SelectedSuite />

            <Group gap={'md'} justify="space-around" align="space-around">
                <PublicKey />
                <PrivateKey />
            </Group>

            <Group gap={'md'} justify="space-around" align="space-around">
                <CertificateComponent />
                <PublicKey />
            </Group>

            <Group gap={'md'} justify="space-around" align="space-around">
                <Random />
                <Random />
            </Group>

            <PreMaster />

            <Master />

            <Input variant="filled" py={'md'} placeholder="Data for transmission"
                value={data} onChange={(event) => setData(event.currentTarget.value)} />
        </Card>
    );
}
