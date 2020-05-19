import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as jwt from "jsonwebtoken";

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODO_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const token = event.headers.Authorization.split(" ")[1];
    const userId = jwt.decode(token).sub;

    const result = await docClient.query({
        TableName: todoTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise();

    const items = result.Items;

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(items)
    };
};


