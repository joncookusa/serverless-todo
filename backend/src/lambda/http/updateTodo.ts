import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import UpdateItemInput = DocumentClient.UpdateItemInput;
import {CreateTodoRequest} from "../../requests/CreateTodoRequest";

const docClient = new AWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODO_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const newItem = {
    ...updatedTodo
  };

  const updateItem : UpdateItemInput = {
    TableName: todoTable,
    Key: {id: todoId},
    UpdateExpression: 'set done = :done',
    ExpressionAttributeValues: {
      ":done": newItem.done
    }
  };

  console.log(updateItem);

  await docClient.update(
      updateItem,
  ).promise();

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      updateItem
    })
  }
}
