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

    const selectedSuite = "TLS_RSA_WITH_AES_256_CBC_SHA256";
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
        async function handleClockState() {
            if (clock === 0) {
                console.log("Server: Server Reset.");
            } else if (clock === 2) {
                console.log("Server: Clock equals 2, Client Message Received as shown below.");
                console.log(message);

                console.log("Server: Server Hello Initiated.");
                const serverHelloTemp = ServerHello(message);

                console.log("Server: Server Certificate Transmission Initiated.");
                const serverCertificateTemp = ServerCertificate();

                console.log("Server: Server Hello Done Initiated.");
                const serverDoneTemp = ServerDone();

                if (publicKey) {
                    try {
                        const jwk = await window.crypto.subtle.exportKey('jwk', publicKey);
                        console.log("Server: Server Public Key Exported As Below.");
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
                    } catch (error) {
                        console.error("Error exporting public key:", error);
                    }
                }
            } else if (clock === 4) {
                console.log("Server: Clock equals 4, Client Message Received as shown below.");
                console.log(message);

                console.log("Server: Client Pre-Master Secret pairing Initiated.");
                try {
                    await computeMasterSecret(message);

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
                } catch (error) {
                    console.error("Error during master secret computation or server finished:", error);
                }
            } else if (clock === 5) {
                console.log("Server: Clock equals 5, Application Data reception Initiated.");
            }
        }

        handleClockState();
    }, [clock]);

    useEffect(() => {
        async function handleApplicationData() {
            if (clock === 5 && secret) {
                console.log("Server: Application Data Received As Show Below.");
                console.log(message);
                try {
                    const result = await PreMasterSecret.decryptData(secret, message.encryptedData, message.iv);
                    console.log("Server: Application Data Received As Show Below.");
                    console.log(result);
                } catch (error) {
                    console.error("Error decrypting application data:", error);
                }
            }
        }

        handleApplicationData();
    }, [message, clock, secret]);


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
        if (message.cipherSuites.includes(selectedSuite)) {
            console.log('Server: supported ciphersuite exists in message.');
            const temp = {
                tlsVersion: 'TLSv1.2',
                cipherSuite: selectedSuite,
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
                const preMasterTemp = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, encryptedPreMasterTemp);
                console.log("Server: Pre-Master Secret Decrypted As Below.");
                console.log(preMasterTemp);
                setPreMaster(preMasterTemp);

                if (clientRandom) {
                    // Assuming PreMasterSecret.prf is an async function that returns a Promise
                    const masterSecret = await PreMasterSecret.prf(preMasterTemp, 'master secret', PreMasterSecret.combineArrayBuffers(clientRandom, random));
                    console.log("Server: Master Secret Computed As Below.");
                    console.log(masterSecret);
                    setMaster(masterSecret);

                    const key = await PreMasterSecret.importSeedAsKey(masterSecret);
                    const secret = await PreMasterSecret.deriveSymmetricKey(key, PreMasterSecret.combineArrayBuffers(clientRandom, random), 256);
                    console.log("Server: Secret Key Computed As Below.");
                    console.log(secret);
                    setSecret(secret);
                }
            } catch (error) {
                console.error("Error during decryption or master secret computation:", error);
            }
        }
    }


    return (
        <Card shadow="sm" p="md" bg={'#151d23'} w={'25vw'} radius={'1rem'} withBorder >
            <Card.Section>

            </Card.Section>

            <SelectedSuite selectedSuite={selectedSuite} />

            <PrivateKey />

            <Group gap={'md'} justify="space-around" align="space-around">
                <CertificateComponent certificate={certificate} />
                <PublicKey publicKey={publicKey} />
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