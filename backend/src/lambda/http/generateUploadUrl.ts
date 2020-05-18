import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from "aws-sdk";
import {createLogger} from "../../utils/logger";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import UpdateItemInput = DocumentClient.UpdateItemInput;

const S3_BUCKET = process.env.S3_BUCKET;
const docClient = new AWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODO_TABLE;


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const logger = createLogger('upload');

  const attachmentUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${todoId}`;

  const updateItem : UpdateItemInput = {
    TableName: todoTable,
    Key: {id: todoId},
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
      ":attachmentUrl": attachmentUrl
    }
  };

  await docClient.update(
      updateItem,
  ).promise();

  const s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: 'us-east-1',
    params: {bucket: `${S3_BUCKET}`}
  });

  const uploadUrl = s3.getSignedUrl('putObject', {
                    Bucket: `${S3_BUCKET}`,
                    Key: `${todoId}`,
                    Expires: (60 * 5)
  });

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({uploadUrl : uploadUrl})
  }
};
