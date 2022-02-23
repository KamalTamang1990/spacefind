import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../Services/SpacesTable/Read';

// createing an event
const event: APIGatewayProxyEvent= {
    queryStringParameters:{
        spaceId: '48d4c697-9def-4e96-8233-bb8c11af47b1'
    }
} as any;

const result = handler(event, {} as any).then((apiResult)=>{
    const items = JSON.parse(apiResult.body);
    console.log(123)
});