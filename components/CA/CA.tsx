import { Drawer, Text, Button, Divider, Title, Paper, Card, Group, Image } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { TlsServerCertificate } from "@/models/handshake";

export default function CA({ ca }: { ca: TlsServerCertificate[] }) {
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Drawer opened={opened} onClose={close} title="CertificateAuthority">
                <Paper shadow="xs" p="md">
                    <Title order={3}>
                        简介
                    </Title>
                    <Text>
                        证书颁发机构（Certificate Authority，简称CA）是一个可信的第三方机构，它负责颁发和管理数字证书。
                        数字证书是一种电子文档，用于证明个人、组织或设备的身份，以及其他相关信息，如公钥。
                        CA通过验证申请者的身份和信息，然后签发证书，以此来确保网络通信的安全性和可信度。
                    </Text>
                </Paper>
                <Divider />
                <Paper shadow="xs" p="md">
                    <Title order={3}>
                        工作流程
                    </Title>
                    <Text>
                        在TLS中，客户端在接收到由服务器传来的证书后，会进行以下流程：
                        <br />
                        1.验证证书的有效性：客户端首先会检查服务器证书的有效期，确保证书在当前时间内有效。
                        <br />
                        2.验证证书链：客户端会检查证书是否由受信任的证书颁发机构（CA）签发，并且证书链是否完整。这通常涉及到验证证书的签名是否由上一级CA的私钥签名，以及上一级CA的证书是否也由其上一级CA签名，直到达到一个受信任的根CA。
                        <br />
                        3.验证证书的主题：客户端会检查证书的主题（Subject）是否与其尝试连接的服务器的域名匹配。这一步确保证书是为当前服务器签发的。
                        <br />
                        4.验证证书的扩展信息：如果证书包含扩展信息（例如，主题备用名称（SANs）），客户端会检查这些信息是否也与其尝试连接的服务器匹配。
                        <br />
                        5.验证证书的指纹：客户端可以选择性地验证证书的指纹，以确保证书的完整性。
                        <br />
                        <Divider />
                        在本项目中，由于时间限制和复杂度的考虑，客户端和服务器间仅存在证书交换，不进行验证过程。
                        <br />
                        证书验证过程图示如下：
                        <Image
                            src={'/certificate-chain.png'}
                            alt='certificate-chain.pnng'
                            radius={'md'}
                            py={'md'}
                        />
                    </Text>
                </Paper>
                <Divider />
                <Paper shadow="xs" p="md">
                    <Title order={3}>
                        本地的CA列表
                    </Title>
                    {ca.map((cert, index) => (
                        <CertificateCard certificate={cert} key={index} />
                    ))}
                </Paper>
            </Drawer>
            <Button onClick={open} justify="center" fullWidth variant="default" mt="md">
                Certificate Authority
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