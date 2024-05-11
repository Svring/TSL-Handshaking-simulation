'use client'

import { Drawer, Text, Button, Divider, Title, Paper, List } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

export default function PrivateKey({ privateKey }: { privateKey: JsonWebKey | undefined }) {
    const [opened, { open, close }] = useDisclosure(false);

    const displayJsonWebKey = (key: JsonWebKey) => {
        return (
            <List>
                <List.Item><strong>Key Type:</strong> {key.kty}</List.Item>
                <List.Item><strong>Algorithm:</strong> {key.alg}</List.Item>
                <List.Item><strong>Public Exponent:</strong> {key.e}</List.Item>
                <List.Item>
                    <strong>n:</strong>
                    <Text style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {key.n}
                    </Text>
                </List.Item>
                <List.Item>
                    <strong>p:</strong>
                    <Text style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {key.p}
                    </Text>
                </List.Item>
                <List.Item>
                    <strong>q:</strong>
                    <Text style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {key.q}
                    </Text>
                </List.Item>
                <List.Item>
                    <strong>qi:</strong>
                    <Text style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {key.qi}
                    </Text>
                </List.Item>
                <List.Item>
                    <strong>d:</strong>
                    <Text style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {key.d}
                    </Text>
                </List.Item>
                <List.Item>
                    <strong>dp:</strong>
                    <Text style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {key.dp}
                    </Text>
                </List.Item>
                <List.Item>
                    <strong>dq:</strong>
                    <Text style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {key.dq}
                    </Text>
                </List.Item>
            </List>
        );
    };

    return (
        <>
            <Drawer opened={opened} onClose={close} title="Private Key">
            <Paper shadow="xs" p="md">
                    <Title order={3}>
                        简介
                    </Title>
                    <Text>
                        在TLS握手过程的初期阶段，客户端使用服务器的公钥加密一个随机生成的预主密钥，然后将加密后的信息发送给服务器。
                        服务器使用自己的私钥来解密这个信息，从而获取到预主密钥。
                    </Text>
                </Paper>
                <Divider />
                <Paper shadow="xs" p="md">
                    <Title order={3}>
                        服务器私钥：
                    </Title>
                    <br />
                    {privateKey && typeof privateKey === 'object' && displayJsonWebKey(privateKey)}
                </Paper>
            </Drawer>
            <Button onClick={open} justify="center" fullWidth variant="default" mt="md">
                私钥
            </Button>
        </>
    )
}