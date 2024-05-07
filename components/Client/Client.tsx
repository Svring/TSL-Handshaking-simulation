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

export default function Client({ clock, message, setMessage }:
    { clock: number, message: any, setMessage: Dispatch<any> }) {

    const [ca, setCa] = useState<TlsServerCertificate[]>(Certificate.certificateAuthority);
    const [ciphersuite, setCiphersuite] = useState<string[]>([]);
    const [publicKey, setPublicKey] = useState<JsonWebKey>();
    const [privateKey, setPrivateKey] = useState<JsonWebKey>();
    const [random, setRandom] = useState<ArrayBuffer>(Buffer.from(''));
    const [certificate, setCertificate] = useState<TlsServerCertificate>();
    const [preMaster, setPreMaster] = useState<Buffer>(Buffer.from(''));
    const [data, setData] = useState<string>();

    useEffect(() => {
        setCiphersuite(Ciphersuite.cipherSuites);

        generateKeyPair();

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
            const clientKeyExchangeTemp = clientKeyExchange(message);

            console.log("Client: Client ChangeCipherSpec Initiated.");
            const changeCipherSpecTemp = changeCipherSpec();

            console.log("Client: Client Finished Initiated.");
            const clientFinishedTemp = clientFinished();

            const messageTemp = { clientKeyExchangeTemp, changeCipherSpecTemp, clientFinishedTemp };
            setMessage(messageTemp);
            console.log("Client: Client Finished Done, message shown below.");
            console.log(messageTemp);
        }
        if (clock === 5) {
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
                window.crypto.subtle.exportKey('jwk', publicKey)
                    .then(jwk => {
                        setPublicKey(jwk)
                    })
                window.crypto.subtle.exportKey('jwk', privateKey)
                    .then(jwk => {
                        setPrivateKey(jwk)
                    })
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

    function clientKeyExchange(message: any): TlsClientKeyExchange {
        return {
            preMasterSecret: preMaster
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
