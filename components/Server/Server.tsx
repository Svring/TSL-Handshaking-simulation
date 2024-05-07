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
    const [publicKey, setPublicKey] = useState<JsonWebKey>();
    const [privateKey, setPrivateKey] = useState<JsonWebKey>();
    const [random, setRandom] = useState<ArrayBuffer>(Buffer.from(''));
    const [certificate, setCertificate] =
        useState<TlsServerCertificate>(Certificate.certificateAuthority[0]);

    useEffect(() => {
        generateKeyPair();
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
            const serverCertificateTemp = ServerCertificate(message);

            console.log("Server: Server Hello Done Initiated.");
            const serverDoneTemp = ServerDone(message);

            const messageTemp = { serverHelloTemp, serverCertificateTemp, serverDoneTemp };
            setMessage(messageTemp);
            console.log("Server: Server Hello Done, message shown below.");
            console.log(messageTemp);
        }
        if (clock === 4) {
            console.log("Server: Clock equals 4, Client Message Received as shown below.");
            console.log(message);

            console.log("Server: Client ChangeCipherSpec Initiated.");
            const changeCipherSpecTemp = changeCipherSpec();

            console.log("Server: Client Finished Initiated.");
            const clientFinishedTemp = serverFinished();

            const messageTemp = { changeCipherSpecTemp, clientFinishedTemp };
            setMessage(messageTemp);
            console.log("Server: Server Finished Done, message shown below.");
            console.log(messageTemp);
        }
        if (clock === 5) {
            console.log("Server: Clock equals 5, Application Data reception Initiated.");
        }
    }, [clock]);


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

    function ServerHello(message: TlsClientHello): TlsServerHello | undefined {
        if (message.cipherSuites.includes(supportedSuite)) {
            console.log('supported ciphersuite exists in message.');
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

    function ServerCertificate(message: TlsClientHello): TlsServerCertificate {
        return certificate;
    }

    function ServerDone(message: TlsClientHello): TlsServerHelloDone {
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