import { S3Client } from "@aws-sdk/client-s3";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import Jwt from "jsonwebtoken";
import { ERoles, IUser } from "../../models/UserModel.js";

const client = new STSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_USER_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const connect: (token?: string) => Promise<S3Client> = async (token?) => {
  const REGION = "eu-north-1";
  enum EArnBasedOnRole {
    admin = "arn:aws:iam::963690327512:role/generalstore.com-moderator",
    user = "arn:aws:iam::963690327512:role/generalstore.com-user",
  }
  let arn = EArnBasedOnRole.user;

  if (token) {
    const payload = Jwt.verify(token, process.env.TOKEN_SECRET);
    if (!payload) throw new Error("No access");
    if (payload && typeof payload !== "string") {
      const user = payload._doc as IUser;
      if (user.role === ERoles.admin) arn = EArnBasedOnRole.admin;
    }
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
