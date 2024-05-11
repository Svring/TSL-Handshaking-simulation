import { Drawer, Text, Button, Divider } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

export default function Random({ name, random }: { name: string, random: ArrayBuffer }) {
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
            <Drawer opened={opened} onClose={close} title="Random">
                <Text>
                    随机数由客户端或服务器独立生成，长度为32字节，用于在后续生成主密钥时引入更多随机性。
                </Text>
                <Divider />
                <Text>
                    随机数编码字符为：
                    <br />
                    {displayArrayBuffer(random)}
                </Text>
            </Drawer>
            <Button onClick={open} justify="center" w={'45%'} variant="default" mt="md">
                {name}
            </Button>
        </>
    )
}