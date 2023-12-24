import { S3Client } from "@aws-sdk/client-s3";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { ERoles } from "../../models/UserModel.js";

const client = new STSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_USER_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const connect = async (role? : ERoles) => {
  const REGION = "eu-north-1";
  enum EArnBasedOnRole {
    admin = "arn:aws:iam::963690327512:role/generalstore.com-moderator",
    user = "arn:aws:iam::963690327512:role/generalstore.com-user",
  }
  let arn = EArnBasedOnRole.user;
  switch (role) {
    case ERoles.admin:
      arn = EArnBasedOnRole.admin;
  }
  const command = new AssumeRoleCommand({
    RoleArn: arn,
    RoleSessionName: "session1",
    DurationSeconds: 900,
  });
  try {
    const res = await client.send(command);
    return new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: res.Credentials.AccessKeyId,
        secretAccessKey: res.Credentials.SecretAccessKey,
        expiration: res.Credentials.Expiration,
        sessionToken: res.Credentials.SessionToken,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

export default { connect };
