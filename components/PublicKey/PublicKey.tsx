'use client'

import { Drawer, Text, Button, Divider, Title, Paper, List } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

export default function PublicKey({ publicKey }: { publicKey: JsonWebKey | undefined }) {
    const [opened, { open, close }] = useDisclosure(false);

    const displayJsonWebKey = (key: JsonWebKey) => {
        return (
            <List>
                <List.Item><strong>Key Type:</strong> {key.kty}</List.Item>
                <List.Item><strong>Algorithm:</strong> {key.alg}</List.Item>
                <List.Item><strong>Public Exponent:</strong> {key.e}</List.Item>
                <List.Item>
                    <strong>Public Key:</strong>
                    <Text style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {key.n}
                    </Text>
                </List.Item>
            </List>
        );
    };

    return (
        <>
            <Drawer opened={opened} onClose={close} title="Public Key">
                <Paper shadow="xs" p="md">
                    <Title order={3}>
                        简介
                    </Title>
                    <Text>
                        在TLS握手过程中，服务器公钥起着至关重要的作用。它主要用于以下几个方面：
                        <br />
                        1. 身份验证：服务器公钥通常嵌入在服务器的数字证书中。客户端通过验证这个公钥与证书中的信息是否匹配来确认服务器的身份。数字证书是由受信任的证书颁发机构（CA）签发的，它绑定了服务器的公钥和服务器的身份信息（如域名）。这样，客户端可以通过验证证书的有效性和公钥的正确性，确保与其通信的服务器就是它声称的那一台服务器。
                        <br />
                        2. 密钥交换：在TLS握手过程中，服务器公钥被用来加密客户端生成的预主密钥（pre-master secret）。这个预主密钥是用于后续会话中加密所有通信的会话密钥的基础。通过使用服务器的公钥加密预主密钥，确保了只有持有对应私钥的服务器才能解密这个密钥，从而保证了通信的安全性。
                        <br />
                        3. 加密通信：虽然服务器公钥主要用于加密预主密钥，但在某些TLS版本（如TLS 1.2）中，服务器公钥还可能直接参与到加密通信中。例如，在RSA密钥交换算法中，服务器公钥用于加密客户端生成的随机数，这个随机数随后用于生成会话密钥。然而，在现代的TLS版本（如TLS 1.3），由于性能和安全性的考虑，通常采用更高效的密钥交换算法，如Ephemeral Diffie-Hellman（EDH），其中服务器公钥的作用被简化为仅用于身份验证，而不会直接参与到加密通信中。
                        <br />
                        公钥一般以非明文形式保存在主机上，为了在前端页面显示公钥内容，需要将其以jwk形式导出。
                    </Text>
                </Paper>
                <Divider />
                <Paper shadow="xs" p="md">
                    <Title order={3}>
                        服务器公钥：
                    </Title>
                    <br />
                    {publicKey && typeof publicKey === 'object' && displayJsonWebKey(publicKey as JsonWebKey)}
                </Paper>
            </Drawer >
            <Button onClick={open} justify="center" w={'45%'} variant="default" mt="md">
                公钥
            </Button>
        </>
    )
}