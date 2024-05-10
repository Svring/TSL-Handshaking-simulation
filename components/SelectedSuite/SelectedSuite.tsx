import { Stack, Drawer, Text, Button, Divider, Title, Paper, List } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

export default function Master({ selectedSuite }: { selectedSuite: string }) {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Drawer opened={opened} onClose={close} title="Selected Suite">
                <Paper shadow="xs" p="md">
                    <Text>
                        TLS_RSA_WITH_AES_256_CBC_SHA256
                    </Text>
                </Paper>
            </Drawer>
            <Button fullWidth onClick={open} justify="center" h={'auto'} p={'sm'} variant="default" mt="md">
                <Stack>
                    <Text size="sm" c={'dimmed'}>已选用的加密套件：</Text>
                    <Text>{selectedSuite}</Text>
                </Stack>
            </Button>
        </>
    )
}