'use client'

import { useHover } from "@mantine/hooks";
import { Stack, Text} from "@mantine/core";

export default function InfoField({ field, content }: any) {
    const { hovered, ref } = useHover();

    return (
        <Stack align="center" mt={'sm'} mb={'sm'} gap={'xs'} p={'1rem'}
            ref={ref}
            style={{
                borderRadius: '1rem', backgroundColor: '#454545', flex: 1,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
                boxShadow: hovered ? '0 0 0 1px #ffffff' : 'none',
                outline: hovered ? '1 solid #232323' : 'none',
            }}
        >
            <Text size="xs" c={'dimmed'} style={{ color: 'white' }}>{field}</Text>
            <Text size="sm" style={{ color: 'white' }}>{content}</Text>
        </Stack>
    )
}