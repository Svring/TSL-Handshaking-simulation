import { Drawer, Text, Button, Divider, Title, Paper, List } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

export default function CipherSuite({ cipherSuite }: { cipherSuite: string[] }) {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Drawer opened={opened} onClose={close} title="Supported CipherSuite">
                <Paper shadow="xs" p="md">
                    <Title order={3}>
                        简介
                    </Title>
                    <Text>
                        在TLS（传输层安全性）中，加密套件（Cipher Suite）是一组指令，通过这些指令可以实现通过TLS建立安全的网络连接。
                        加密套件提供了一组算法和协议，这些算法和协议用于在客户端和服务器之间安全通信。在HTTPS连接的初始化过程中，
                        客户端和服务器会进行SSL握手过程，握手过程中两方会同意使用一种互相支持的加密套件，然后使用这个加密套件来协商一个安全的HTTPS连接。
                    </Text>
                </Paper>
                <Divider />
                <Paper shadow="xs" p="md">
                    <Title order={3}>
                        工作流程
                    </Title>
                    <Text>
                        加密套件由以下三部分组成：
                        <br />
                        1. 非对称加密算法：RSA, Diffie-Hellman, Elliptic Curve Diffie-Hellman）
                        <br />
                        2. 对称加密算法：AES (Advanced Encryption Standard), RC4, 3DES_EDE_CBC，后两者相对于AES存在明显缺陷
                        <br />
                        3. 哈希算法：SHA
                        <br />
                        其中，非对称加密算法主要用于证书效验和密钥交换，对称加密算法主要用于数据传输，哈希算法用于验证信息完整性。
                        <br />
                        在Hello阶段，客户端告知服务器自己支持的加密套件列表，服务器选中一个用于本次会话，
                        <br />
                        本项目选用的加密套件是TLS_RSA_WITH_AES_256_CBC_SHA256.
                    </Text>
                </Paper>
                <Divider />
                <Paper shadow="xs" p="md">
                    <Title order={3}>
                        本地支持的加密套件列表：
                    </Title>
                    <br />
                    <List type="ordered">
                        {
                            cipherSuite.map((item, index) => (
                                <List.Item key={index}>{item}</List.Item>
                            ))
                        }
                    </List>
                </Paper>
            </Drawer>
            <Button onClick={open} justify="center" fullWidth variant="default" mt="md">
                支持的加密套件
            </Button>
        </>
    )
}