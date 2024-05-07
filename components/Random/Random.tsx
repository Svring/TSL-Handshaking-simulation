import { Drawer, Text, Button, Divider } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

export default function Random() {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Drawer opened={opened} onClose={close} title="Random">
                <Text>
                    证书颁发机构（Certificate Authority，简称CA）是一个可信的第三方机构，它负责颁发和管理数字证书。
                    数字证书是一种电子文档，用于证明个人、组织或设备的身份，以及其他相关信息，如公钥。
                    CA通过验证申请者的身份和信息，然后签发证书，以此来确保网络通信的安全性和可信度。
                </Text>
                <Divider />
                <Text>
                    在TLS
                </Text>
            </Drawer>
            <Button onClick={open} justify="center" w={'45%'} variant="default" mt="md">
                随机数
            </Button>
        </>
    )
}