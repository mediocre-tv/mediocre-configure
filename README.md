# Mediocre Configure

Webapp for creating a mediocre configuration. A work in progress.

![image-labeller.png](screenshots/image-labeller.png)

## Contributing

### Run with HTTP

```shell
npm run dev
```

### Run with HTTPS

To run securely you'll need to provide some TLS certificates, [vite.config.ts](vite.config.ts) looks for certificates
at `.certs/localhost`, so place yours there, then use the same run script as with HTTP.

```shell
npm run dev
```

If you do not have your own TLS certificates, you can generate your own self-signed certificates. You can follow the
[Let's Encrypt guide](https://letsencrypt.org/docs/certificates-for-localhost/) for making and trusting your own
certificates. The general steps are:
1. Install [minica](https://github.com/jsha/minica)
2. Generate root and end certificates `minica --domains localhost`
3. Import the root certificate `Import-Certificate -FilePath .\minica.pem -CertStoreLocation cert:\CurrentUser\Root`
4. Mount the end certificates to your docker container `-v /path/to/your/certs/localhost:/certificates:ro`