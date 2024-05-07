'use client'

import Client from '@/components/Client/Client';
import Server from '@/components/Server/Server';
import { Flex, RingProgress, Text } from "@mantine/core";
import { useState, useEffect } from "react";

export default function HomePage() {
    const [clock, setClock] = useState<number>(0);
    const [message, setMessage] = useState<any>({});

    useEffect(() => {
        if (clock >= 6) {
            setClock(0);
        }
    }, [clock])

    return (
        <>
            <Flex direction={'row'} w={'100vw'} h={'100vh'} justify={'space-around'}
                align={'center'} bg={'#000000'}
            >
                <Client clock={clock} message={message} setMessage={setMessage} />
                <Server clock={clock} message={message} setMessage={setMessage} />
                <RingProgress
                    style={{
                        position: 'absolute',
                        top: '8%',
                        left: '85%',
                        cursor: 'pointer'
                    }}
                    roundCaps
                    size={100}
                    sections={[{ value: clock * 20, color: 'blue' }]}
                    onClick={() => setClock(clock + 1)}
                    label={
                        <Text c="blue" fw={700} ta="center" size="xl">
                            {clock}
                        </Text>
                    }
                />
            </Flex>
        </>
    );
}
