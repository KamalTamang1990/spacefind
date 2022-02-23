import { CfnOutput } from "aws-cdk-lib";
import { CognitoUserPoolsAuthorizer, RestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient, CfnUserPoolGroup} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { isThisTypeNode } from "typescript";



export class AuthorizerWrapper {
    // scope of type Construct
    private scope: Construct;
    // scope of type RestApi
    private api: RestApi;


    // cognito userpool of type userpool
    private userPool: UserPool;
    // UserpoolClient
    private userPoolClient: UserPoolClient;
    // Authorizer. will be used outside the class 
    public authorizer: CognitoUserPoolsAuthorizer;

    constructor(scope: Construct, api: RestApi){
        this.scope = scope;
        this.api = api;
        this.initialize();
        
    }

    private initialize(){
        // Create Userpool
        this.createUserPool();
        this.addUserPoolClient();
        this.createAuthorizer();
        this.createAdminsGroup(); // creating cognito groups

    }
    // create userpoll properties
    private createUserPool(){
        this.userPool = new UserPool(this.scope, 'SpaceUserPool',{
            userPoolName: 'SpaceUserPool',
            selfSignUpEnabled: true,
            // user can sign in with username or email
            signInAliases: {
                username: true,
                email: true,

            }
        });
        // output to print userpool id 
        new CfnOutput(this.scope, 'UserPoolId',{
            value: this.userPool.userPoolId
        })

    }
    // creating userpoolclient
    private addUserPoolClient(){
        this.userPoolClient = this.userPool.addClient('SpaceUserPool-client',{
            userPoolClientName: 'SpaceUserPool-client',
            authFlows:{
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            }, 
            generateSecret: false
        });
        // output to print userpool client id
        new CfnOutput(this.scope, 'UserPoolClientId',{
            value: this.userPoolClient.userPoolClientId
        })
    }
    //Autorizer which will be used by our application
    private createAuthorizer(){
        this.authorizer = new CognitoUserPoolsAuthorizer(this.scope, 'SpaceUserAuthorizer',{
            cognitoUserPools: [this.userPool],
            authorizerName: 'SpaceUserAuthorizer',
            identitySource: 'method.request.header.Authorization'

        });
        // attaching Authorizer to Rest Api
        this.authorizer._attachToApi(this.api);

        
    }
    // creating group for userpool
    private createAdminsGroup(){
        new CfnUserPoolGroup(this.scope, 'admins', {
            groupName: 'admins',
            userPoolId: this.userPool.userPoolId
        })

    }

}