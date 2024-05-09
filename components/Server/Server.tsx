'use client'

import { Card, Group } from "@mantine/core";
import { useState, useEffect, Dispatch } from "react";
import { RsaKeyPair } from "@/models/RsaKeyPair";
import {
    TlsServerHello, TlsClientHello,
    TlsServerCertificate, TlsServerHelloDone,
    TlsChangeCipherSpec, TlsFinished
} from "@/models/handshake";
import { Certificate } from "@/models/Certificate";
import { PreMasterSecret } from '../../models/MasterSecret';

import PublicKey from "../PublicKey/PublicKey";
import PrivateKey from "../PrivateKey/PrivateKey";
import CertificateComponent from "../Certificate/Certificate";
import Random from "../Random/Random";
import PreMaster from "../PreMaster/PreMaster";
import Master from "../Master/Master";
import SelectedSuite from "../SelectedSuite/SelectedSuite";

export default function Server({ clock, message, setMessage }:
    { clock: number, message: any, setMessage: Dispatch<any> }) {

    const supportedSuite = "TLS_RSA_WITH_AES_256_CBC_SHA256";
    const [publicKey, setPublicKey] = useState<CryptoKey>();
    const [privateKey, setPrivateKey] = useState<CryptoKey>();
    const [random, setRandom] = useState<ArrayBuffer>(Buffer.from(''));
    const [clientRandom, setClientRandom] = useState<ArrayBuffer>();
    const [certificate, setCertificate] =
        useState<TlsServerCertificate>(Certificate.certificateAuthority[0]);
    const [preMaster, setPreMaster] = useState<ArrayBuffer>(Buffer.from(''));
    const [master, setMaster] = useState<ArrayBuffer>(Buffer.from(''));
    const [secret, setSecret] = useState<CryptoKey>();

    useEffect(() => {
        generateKeyPair();

        generateRandom();
    }, []);

    useEffect(() => {
        if (clock === 0) {
            console.log("Server: Server Reset.");
        }
        if (clock === 2) {
            console.log("Server: Clock equals 2, Client Message Received as shown below.");
            console.log(message);

            console.log("Server: Server Hello Initiated.");
            const serverHelloTemp = ServerHello(message);

            console.log("Server: Server Certificate Transmission Initiated.");
            const serverCertificateTemp = ServerCertificate();

            console.log("Server: Server Hello Done Initiated.");
            const serverDoneTemp = ServerDone();

            if (publicKey) {
                window.crypto.subtle.exportKey('jwk', publicKey)
                    .then(jwk => {
                        console.log("Server: Server Public Key Exoirted As Below.");
                        console.log(jwk);
                        const messageTemp = {
                            serverHello: serverHelloTemp,
                            serverCertificate: serverCertificateTemp,
                            serverPublicKey: jwk,
                            serverDone: serverDoneTemp
                        };
                        setMessage(messageTemp);
                        console.log("Server: Server Hello Done, message shown below.");
                        console.log(messageTemp);
                    })
            }
        }
        if (clock === 4) {
            console.log("Server: Clock equals 4, Client Message Received as shown below.");
            console.log(message);

            console.log("Server: Client Pre-Master Secret paring Initiated.");
            computeMasterSecret(message)
                .then(data => {
                    console.log("Server: Server ChangeCipherSpec Initiated.");
                    const changeCipherSpecTemp = changeCipherSpec();

                    console.log("Server: Server Finished Initiated.");
                    const serverFinishedTemp = serverFinished();

                    const messageTemp = {
                        changeCipherSpec: changeCipherSpecTemp,
                        serverFinished: serverFinishedTemp
                    };
                    setMessage(messageTemp);
                    console.log("Server: Server Finished Done, message shown below.");
                    console.log(messageTemp);
                })
        }
        if (clock === 5) {
            console.log("Server: Clock equals 5, Application Data reception Initiated.");
        }
    }, [clock]);

    useEffect(() => {
        if (clock === 5) {
            if (secret) {
                console.log("Server: Application Data Received As Show Below.");
                console.log(message);
                decryptData(secret, message.encryptedData, message.iv)
                    .then(result => {
                        console.log("Server: Application Data Received As Show Below.");
                        console.log(result);
                    })
            }
        }
    }, [message]);

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

    function ServerHello(message: TlsClientHello): TlsServerHello | undefined {
        if (message.tlsVersion !== 'TLSv1.2') {
            console.log('Server: tls version does not match.');
            return;
        }
        if (message.random) {
            console.log('Server: Client Random Received As Show Below.');
            console.log(message.random);
            setClientRandom(message.random);
        }
        if (message.cipherSuites.includes(supportedSuite)) {
            console.log('Server: supported ciphersuite exists in message.');
            const temp = {
                tlsVersion: 'TLSv1.2',
                cipherSuite: supportedSuite,
                random: random,
                extensions: {
                    serverName: 'example.com',
                    maxFragmentLength: 2048,
                },
            };
            return temp;
        }
    }

    function ServerCertificate(): TlsServerCertificate {
        return certificate;
    }

    function ServerDone(): TlsServerHelloDone {
        return {
            messageType: 'serverHelloDone'
        }
    }

    function changeCipherSpec(): TlsChangeCipherSpec {
        return {
            messageType: 'changeCipherSpec'
        }
    }

    function serverFinished(): TlsFinished {
        return {
            messageType: 'finished',
            verifyData: Buffer.from('')
        }
    }

    async function computeMasterSecret(message: any) {
        console.log("Server: Master Secret computation initiated.");

        const encryptedPreMasterTemp = message.clientKeyExchange.preMasterSecret;
        console.log("Server: Encrypted Pre-Master Secret Received As Below.");
        console.log(encryptedPreMasterTemp);

        if (privateKey) {
            try {
                // Use await to wait for the decryption to complete
                const preMasterTemp = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' },
                    privateKey, encryptedPreMasterTemp);
                console.log("Server: Pre-Master Secret Decrypted As Below.");
                console.log(preMasterTemp);
                setPreMaster(preMasterTemp);

                if (clientRandom) {
                    // Assuming PreMasterSecret.prf is an async function that returns a Promise
                    const masterSecret = await PreMasterSecret.prf(preMasterTemp, 'master secret', combineArrayBuffers(clientRandom, random));
                    console.log("Server: Master Secret Computed As Below.");
                    console.log(masterSecret);
                    setMaster(masterSecret);

                    importSeedAsKey(masterSecret)
                        .then(key => {
                            deriveSymmetricKey(key, combineArrayBuffers(clientRandom, random), 256)
                                .then(secret => {
                                    console.log("Server: Secret Key Computed As Below.");
                                    console.log(secret);
                                    setSecret(secret);
                                })
                        })
                }
            } catch (error) {
                console.error("Error during decryption or master secret computation:", error);
            }
        }
    }

    async function encryptData(key: CryptoKey, data: string): Promise<{ encryptedData: ArrayBuffer, iv: Uint8Array }> {
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


    return (
        <Card shadow="sm" p="md" bg={'#151d23'} w={'25vw'} radius={'1rem'} withBorder >
            <Card.Section>

            </Card.Section>

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
        </Card>
    );
}