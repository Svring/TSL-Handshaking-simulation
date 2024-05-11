'use client'

import { Card, Group, Input } from "@mantine/core";
import { useState, useEffect, Dispatch } from "react";
import { Ciphersuite } from "@/models/ciphersuite";
import { Certificate } from "@/models/Certificate";
import {
    TlsServerCertificate, TlsClientHello,
    TlsClientKeyExchange, TlsChangeCipherSpec, TlsFinished
} from "@/models/handshake";

import CA from "../CA/CA";
import CipherSuite from "../CipherSuite/CipherSuite";
import PublicKey from "../PublicKey/PublicKey";
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
    const [selectedSuite, setSelectedSuite] = useState<string>('');
    const [random, setRandom] = useState<ArrayBuffer>(Buffer.from(''));
    const [serverRandom, setServerRandom] = useState<ArrayBuffer>(Buffer.from(''));
    const [serverPublic, setServerPublic] = useState<JsonWebKey>();
    const [certificate, setCertificate] = useState<TlsServerCertificate>();
    const [preMaster, setPreMaster] = useState<ArrayBuffer>(Buffer.from(''));
    const [master, setMaster] = useState<ArrayBuffer>(Buffer.from(''));
    const [secret, setSecret] = useState<CryptoKey>();

    useEffect(() => {
        generateRandom();
    }, []);

    useEffect(() => {
        async function handleClockState() {
            if (clock === 0) {
                setData('');
                setCa(Certificate.certificateAuthority);
                setCiphersuite(Ciphersuite.cipherSuites);
                setSelectedSuite('');
                setRandom(Buffer.from(''));
                setServerRandom(Buffer.from(''));
                setServerPublic(undefined);
                setCertificate(undefined);
                setPreMaster(Buffer.from(''));
                setMaster(Buffer.from(''));
                setSecret(undefined);
                console.log("Client: Client Reset.");
            } else if (clock === 1) {
                console.log("Client: Clock equals 1, client hello initiated.");
                const clientHelloTemp = clientHello();

                setMessage(clientHelloTemp);
                console.log("Client: Client Hello Done, message shown below.");
                console.log(clientHelloTemp);
            } else if (clock === 3) {
                console.log("Client: Clock equals 3, server's message shown below.");
                console.log(message);

                console.log("Client: Client Key Exchange Initiated.");
                try {
                    const clientKeyExchangeTemp = await clientKeyExchange(message);

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
                } catch (error) {
                    console.error("Error during client key exchange or client finished:", error);
                }
            } else if (clock === 5) {
                await computeMasterSecret();
                console.log("Client: Clock equals 5, Application Data Delivery Initiated.");
            }
        }

        handleClockState();
    }, [clock]);


    function generateRandom() {
        const clientRandom = new Uint8Array(32);
        // Fill the array with cryptographically strong random values
        window.crypto.getRandomValues(clientRandom);
        // Return the generated random value
        setRandom(clientRandom);
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
            console.log(message.serverHello.random);
            setServerRandom(message.serverHello.random);
        }

        if (message.serverHello.cipherSuite) {
            console.log("Client: Server Selected Suite As Shown Below.");
            console.log(message.serverHello.cipherSuite);
            setSelectedSuite(message.serverHello.cipherSuite);
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

    async function computeMasterSecret() {
        console.log("Client: Master Secret computation initiated.");

        if (serverRandom) {
            try {
                const masterSecret = await PreMasterSecret.prf(preMaster, 'master secret', PreMasterSecret.combineArrayBuffers(random, serverRandom));
                console.log("Client: Master Secret Computed As Below.");
                console.log(masterSecret);
                setMaster(masterSecret);

                const key = await PreMasterSecret.importSeedAsKey(masterSecret);
                const secret = await PreMasterSecret.deriveSymmetricKey(key, PreMasterSecret.combineArrayBuffers(random, serverRandom), 256);
                console.log("Client: Secret Key Computed As Below.");
                console.log(secret);
                setSecret(secret);

                console.log(`Client: Data delivered is ${data}`);
                const result = await PreMasterSecret.encryptData(secret, data);
                setMessage(result);
            } catch (error) {
                console.error("Client: Error during Master Secret computation:", error);
            }
        }
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

            <CipherSuite cipherSuite={ciphersuite} />

            <SelectedSuite selectedSuite={selectedSuite} />

            <Group gap={'md'} justify="space-around" align="space-around">
                <CertificateComponent certificate={certificate} />
                <PublicKey publicKey={serverPublic} />
            </Group>

            <Group gap={'md'} justify="space-around" align="space-around">
                <Random name="客户端随机数" random={random} />
                <Random name="服务器随机数" random={serverRandom} />
            </Group>

            <PreMaster preMaster={preMaster} />

            <Master master={master} />

            <Input variant="filled" py={'md'} placeholder="Data for transmission"
                value={data} onChange={(event) => setData(event.currentTarget.value)} />
        </Card>
    );
}
