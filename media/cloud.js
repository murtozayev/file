import { Client } from "minio";

const minioClient = new Client({
  endPoint: "host.docker.internal",
  port: 9000,
  useSSL: false,
  accessKey: "whoami",
  secretKey: "no0system0is0safe",
});

export default minioClient;
