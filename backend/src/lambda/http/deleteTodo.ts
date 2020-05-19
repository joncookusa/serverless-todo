import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {CreateTodoRequest} from "../../requests/CreateTodoRequest";
import * as AWS from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import DeleteItemInput = DocumentClient.DeleteItemInput;
import * as jwt from "jsonwebtoken";

const docClient = new AWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODO_TABLE;


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;

  const token = event.headers.Authorization.split(" ")[1];
  const userId = jwt.decode(token).sub;

  const deleteItem : DeleteItemInput = {TableName : todoTable, Key: {userId: userId, id: todoId}};

  await docClient.delete(
    deleteItem
  ).promise();

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
    })
  }
};
