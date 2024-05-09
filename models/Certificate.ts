import { TlsServerCertificate } from "./handshake";

export class Certificate {
    static certificateAuthority: TlsServerCertificate[] = [
        {
            version: 'v3',
            serialNumber: '1234567890',
            signature: {
                algorithm: 'SHA256withRSA',
                signature: Buffer.from('signature1'),
            },
            issuer: {
                countryName: 'US',
                stateOrProvinceName: 'California',
                localityName: 'San Francisco',
                organizationName: 'Example Inc.',
                organizationalUnitName: 'IT Department',
                commonName: 'example.com',
            },
            validity: {
                notBefore: new Date('2023-01-01T00:00:00Z'),
                notAfter: new Date('2025-01-01T00:00:00Z'),
            },
            subject: {
                countryName: 'US',
                stateOrProvinceName: 'California',
                localityName: 'San Francisco',
                organizationName: 'Example Inc.',
                organizationalUnitName: 'IT Department',
                commonName: 'example.com',
            },
            subjectPublicKeyInfo: {
                algorithm: 'RSA',
                publicKey: Buffer.from('publicKey1'),
            },
            extensions: {
                'keyUsage': 'digitalSignature, keyEncipherment',
                'extendedKeyUsage': 'serverAuth',
            },
        },
        {
            version: 'v3',
            serialNumber: '1234567890',
            signature: {
                algorithm: 'SHA256withRSA',
                signature: Buffer.from('aabbccddeeff', 'hex')
            },
            issuer: {
                countryName: 'US',
                stateOrProvinceName: 'California',
                localityName: 'San Francisco',
                organizationName: 'Dummy Org',
                organizationalUnitName: 'IT',
                commonName: 'Dummy Issuer'
            },
            validity: {
                notBefore: new Date('2023-01-01'),
                notAfter: new Date('2025-01-01')
            },
            subject: {
                countryName: 'US',
                stateOrProvinceName: 'New York',
                localityName: 'New York City',
                organizationName: 'Dummy Corp',
                organizationalUnitName: 'Tech',
                commonName: 'dummy.example.com'
            },
            subjectPublicKeyInfo: {
                algorithm: 'RSA',
                publicKey: Buffer.from("-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzN7JGRNqmxP7OPe\nTtWVhTkLkz5s/JGJlOlr2F9LX2INBnyo14/TSeZLs5NwK75Ht9IZemkW9ZP\nX40Zu4n10iLyV5sShStE61Pju1wEQ+S+9JZ59mm8sW17ZTR+JQT1+GznVho\nW8G1FMTyUxyI7mBxr... '-----END PUBLIC KEY-----\n")
            },
            extensions: {
                keyUsage: 'Digital Signature, Key Encipherment',
                subjectAltName: 'DNS:dummy.example.com'
            }
        }
    ];

    static authenticateCertificate(ca: TlsServerCertificate[], certificate: TlsServerCertificate): boolean {
        return false
    }

}