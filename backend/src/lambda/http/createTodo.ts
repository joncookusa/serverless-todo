import 'source-map-support/register'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import * as jwt from 'jsonwebtoken';

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import {createLogger} from "../../utils/logger";

const docClient = new AWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODO_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const logger = createLogger('upload');
  const token = event.headers.Authorization.split(" ")[1];

  const userId = jwt.decode(token).sub;
  const itemId = uuid.v4();

  const newTodo: CreateTodoRequest = JSON.parse(event.body);

  const newItem = {
    id: itemId,
    ...newTodo,
    userId
  };

  await docClient.put({
    TableName: todoTable,
    Item: newItem
  }).promise();

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      id: itemId,
      name: newTodo.name,
      dueDate: newTodo.dueDate
    })
  }
};
