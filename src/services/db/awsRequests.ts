import {
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import awsConnection from "./awsConnection.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose from "mongoose";

const BUCKET = "generalstore.com";
const PRODUCT_PATH = "products/";
const getImagesOfProduct = async (
  productId: mongoose.Types.ObjectId | string,
  token?: string
) => {
  const client = await awsConnection.connect(token);
  const listCommand = new ListObjectsCommand({
    Bucket: BUCKET,
    Prefix: PRODUCT_PATH + productId + "/",
    Delimiter: "/",
  });

  let urls: string[] = [];
  const res = await client.send(listCommand);

  for (let item of res.Contents) {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: item.Key,
    });
    const url = await getSignedUrl(client, command, {
      expiresIn: 300,
    });
    urls.push(url);
  }
  return urls;
};
const addImagesToProduct = async (
  productId: mongoose.Types.ObjectId | string,
  images: Buffer[],
  token: string
) => {
  const client = await awsConnection.connect(token);
  const allImages = await client.send(
    new ListObjectsCommand({
      Bucket: BUCKET,
      Prefix: PRODUCT_PATH + productId + "/",
      Delimiter: "/",
    })
  );
  const lastItemPathArray: string[] = allImages[length - 1].Key.split("/");
  const itemName = lastItemPathArray[lastItemPathArray.length - 1];
  let insertIndex = parseInt(itemName.split(".")[0]); // Last item is calulated by name, to not overwrite items
  let promiseArray: Promise<PutObjectCommandOutput | void>[];
  for (let i of images) {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Body: i,
      Key: PRODUCT_PATH + insertIndex.toString(),
    });
    insertIndex++;
    promiseArray.push(client.send(command)); // Not using await to not block event loop
  }
  Promise.all(promiseArray).catch((e) => {
    throw new Error("Couldn't Upload Images: " + e);
  });
};

export { getImagesOfProduct, addImagesToProduct };
