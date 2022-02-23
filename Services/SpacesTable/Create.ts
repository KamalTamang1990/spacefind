import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from  'aws-lambda'
import {v4} from 'uuid'


const TABLE_NAME = process.env.TABLE_NAME
const dbClient = new DynamoDB.DocumentClient();

async function handler(event:APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: 'Hello form DynamoDb'
    }
    // get data from api proxy event
    // if this type of body (typeof event.body == 'object'? event.body) is object then this item will be the body other wise (: JSON.parse(event.body) parse event
    const item = typeof event.body == 'object'? event.body: JSON.parse(event.body);
    item.spaceId = v4();

   
    try {
        // action for dynamodb ...put item
        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: item
        }).promise()
    }catch(error){
        result.body = (error as Error).message
    }
    result.body = JSON.stringify(`Created item with id: ${item.spaceId}`)

    return result
}
export { handler }