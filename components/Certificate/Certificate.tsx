import { Drawer, Text, Button, Divider, Title, Paper, Card, Group, Image } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { TlsServerCertificate } from "@/models/handshake";

export default function Certificate({ certificate }: { certificate: TlsServerCertificate | undefined }) {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Drawer opened={opened} onClose={close} title="Certificate">

                <Paper shadow="xs" p="md">
                    <Title order={3}>
                        服务器证书：
                    </Title>
                    <br />
                    {
                        certificate ?
                            <CertificateCard certificate={certificate} />
                            :
                            null
                    }
                </Paper>
            </Drawer>
            <Button onClick={open} justify="center" w={'45%'} variant="default" mt="md">
                证书
            </Button>
        </>
    )
}

interface CertificateCardProps {
    certificate: TlsServerCertificate;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
    return (
        <Card shadow="xs" p="md">
            <Text size="xl" fw={700}>
                TLS Server Certificate
            </Text>
            <Paper p="md" style={{ marginTop: 10 }}>
                <Text size="lg" fw={500}>
                    Version: {certificate.version}
                </Text>
                <Text size="lg" fw={500}>
                    Serial Number: {certificate.serialNumber}
                </Text>
                <Text size="lg" fw={500}>
                    Signature Algorithm: {certificate.signature.algorithm}
                </Text>
                <Text size="lg" fw={500}>
                    Issuer:
                </Text>
                <Group>
                    <Text size="md">Country: {certificate.issuer.countryName}</Text>
                    <Text size="md">State/Province: {certificate.issuer.stateOrProvinceName}</Text>
                    <Text size="md">Locality: {certificate.issuer.localityName}</Text>
                    <Text size="md">Organization: {certificate.issuer.organizationName}</Text>
                    <Text size="md">Unit: {certificate.issuer.organizationalUnitName}</Text>
                    <Text size="md">Common Name: {certificate.issuer.commonName}</Text>
                </Group>
                <Text size="lg" fw={500}>
                    Validity: {certificate.validity.notBefore.toLocaleDateString()} to {certificate.validity.notAfter.toLocaleDateString()}
                </Text>
                <Text size="lg" fw={500}>
                    Subject:
                </Text>
                <Group>
                    <Text size="md">Country: {certificate.subject.countryName}</Text>
                    <Text size="md">State/Province: {certificate.subject.stateOrProvinceName}</Text>
                    <Text size="md">Locality: {certificate.subject.localityName}</Text>
                    <Text size="md">Organization: {certificate.subject.organizationName}</Text>
                    <Text size="md">Unit: {certificate.subject.organizationalUnitName}</Text>
                    <Text size="md">Common Name: {certificate.subject.commonName}</Text>
                </Group>
                <Text size="lg" fw={500}>
                    Public Key Algorithm: {certificate.subjectPublicKeyInfo.algorithm}
                </Text>
                <Text lineClamp={4} size="lg" fw={500}>
                    Public Key: {certificate.subjectPublicKeyInfo.publicKey.toString('base64')}
                </Text>
                <Text size="lg" fw={500}>
                    Extensions:
                </Text>
                {Object.entries(certificate.extensions).map(([key, value]) => (
                    <Text key={key} size="md">
                        {key}: {JSON.stringify(value)}
                    </Text>
                ))}
            </Paper>
        </Card>
    );
};