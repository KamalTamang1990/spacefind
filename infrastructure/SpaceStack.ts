
import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs';
import { Code, Function as lambdaFucntion, Runtime } from 'aws-cdk-lib/aws-lambda'
import {join} from 'path';
import { AuthorizationType, LambdaIntegration, MethodOptions, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { gtable } from './gtable';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { AuthorizerWrapper } from './auth/AuthorizerWrapper';


export class SpaceStack extends Stack {
    // api gateway
    private api = new RestApi(this, 'SpaceFindApi')
    private authorizer: AuthorizerWrapper;

    private spacesTable = new gtable(this, {
        tableName: 'SpacesTable',
        primaryKey: 'spaceId',
        createLambdaPath: 'Create'
    })

    constructor(scope: Construct, id: string, props: StackProps ){
        super(scope,id,props)
        //calling authorizer inside constructor
        this.authorizer = new AuthorizerWrapper(this, this.api)
        
        // Node Js function
        const helloLambdaNodeJs = new NodejsFunction(this,'helloLambdaNodeJsFunction',{
            entry: (join(__dirname,'..','Services', 'node-lambda', 'hello.ts')),
            handler: 'handler'
        });
        // s3 policy statement to provide access to s3 bucket
        const s3ListPolicy = new PolicyStatement();
        s3ListPolicy.addActions('s3:ListAllMyBuckets');
        s3ListPolicy.addResources('*')
        helloLambdaNodeJs.addToRolePolicy(s3ListPolicy);

        const optionsWithAuthorizer: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer:{
                authorizerId: this.authorizer.authorizer.authorizerId
            }
        }

       

        //Hello Api Lambda integration:

        const helloLambdaIntegration = new LambdaIntegration(helloLambdaNodeJs) // lambdaintegration object.
        const helloLambdaResource = this.api.root.addResource('hello'); // provide the resoure to our api
        helloLambdaResource.addMethod('GET', helloLambdaIntegration, optionsWithAuthorizer); // provide method 'GET' method

        //Spaces API integrations
        const spaceResource = this.api.root.addResource('spaces');
        spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration);

    }

}