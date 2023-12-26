import {
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import awsConnection from "./awsConnection.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ERoles } from "../../models/UserModel.js";

const BUCKET = "generalstore.com";
const getPath = (productId: string) => {
  const S3_PRODUCT_DIR = "products/";
  return S3_PRODUCT_DIR + productId + "/";
};

const getImageUrls = async (productId: string) => {
  const client = await awsConnection.connect();

  const images = (
    await client.send(
      new ListObjectsCommand({
        Bucket: BUCKET,
        Prefix: getPath(productId),
        Delimiter: "/",
      })
    )
  )?.Contents;

  const urls: string[] = [];
  if (images) {
    for (let item of images) {
      const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: item.Key,
      });
      const url = await getSignedUrl(client, command, {
        expiresIn: 300,
      });
      urls.push(url);
    }
  }
  return urls;
};

const uploadImage = async (productId: string, image: Express.Multer.File) => {
  const client = await awsConnection.connect(ERoles.admin);
  const fileName = Date.now();

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Body: image.buffer,
      Key: getPath(productId) + fileName,
      ContentType: image.mimetype,
    })
  );
  return await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: getPath(productId) + fileName,
    })
  );
};

export default { getImageUrls, uploadImage };
