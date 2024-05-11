import { Drawer, Text, Button, Divider } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

export default function PreMaster({ preMaster }: { preMaster: ArrayBuffer }) {
    const [opened, { open, close }] = useDisclosure(false);

    const displayArrayBuffer = (buffer: ArrayBuffer) => {
        // Create a new TextDecoder instance
        const decoder = new TextDecoder();
        // Convert the ArrayBuffer to a string
        const str = decoder.decode(buffer);
        return str;
    };

    return (
        <>
            <Drawer opened={opened} onClose={close} title="Pre-Master Secret">
                <Text>
                    客户端在接收到服务器的"Server Hello Done"消息后，会生成一个48位的Pre-Master Secret并将其加密后发送给服务器。
                    这个Pre-Master Secret主要用于计算Master Secret。客户端使用服务器的公钥（从服务器证书中获得）对Pre-Master Secret进行加密，
                    而服务器则使用其私钥对加密的Pre-Master Secret进行解密。这种方式确保了Pre-Master Secret在传输过程中的安全性，
                    同时也为后续的Master Secret生成提供了必要的条件2。
                </Text>
                <Divider />
                <Text>
                    Pre-Master Secret:
                    <br />
                    {displayArrayBuffer(preMaster)}
                </Text>
            </Drawer>
            <Button onClick={open} fullWidth justify="center" variant="default" mt="md">
                Pre-Master Secret
            </Button>
        </>
    )
}