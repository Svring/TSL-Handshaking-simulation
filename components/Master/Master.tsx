import { Drawer, Text, Button, Divider } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

export default function Master({ master }: { master: ArrayBuffer }) {
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
            <Drawer opened={opened} onClose={close} title="Master Secret">
                <Text>
                    客户端和服务器使用Pre-Master Secret以及之前在握手过程中交换的随机数（ClientHello.random和ServerHello.random），
                    通过Pseudo-Random Function (PRF)算法计算出Master Secret。PRF是一个确定性的算法，
                    它通过迭代基于SHA256哈希函数的Hash-based Message Authentication Code (HMAC)来产生结果。
                    Master Secret的长度固定为48字节，是用于生成会话密钥的基础。这个过程确保了即使Pre-Master Secret在传输过程中被截获，
                    也无法直接用于加密或解密数据，因为它需要与特定的随机数一起使用才能生成Master Secret.
                </Text>
                <Divider />
                <Text>
                    Master Secret:
                    <br />
                    {displayArrayBuffer(master)}
                </Text>
            </Drawer>
            <Button onClick={open} fullWidth justify="center" variant="default" mt="md">
                Master Secret
            </Button>
        </>
    )
}