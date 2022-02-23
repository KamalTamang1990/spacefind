import { Stack } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { join } from 'path'

export interface TableProps {

    tableName: string,
    primaryKey: string,
    // ? means that this field is optional
    createLambdaPath?: string,
    readLambdaPath?: string,
    updateLambdaPath?: string,
    deleteLambdaPath?: string
    
}


export class gtable {

    private stack: Stack;
    private table: Table;
    private props: TableProps

    private createLambda: NodejsFunction | undefined;
    private readLambda: NodejsFunction | undefined;
    private updateLambda: NodejsFunction | undefined;
    private deleteLambda: NodejsFunction | undefined;

    public createLambdaIntegration: LambdaIntegration;
    public readLambdaIntegration: LambdaIntegration;
    public updateLambdaIntegration: LambdaIntegration;
    public deleteLambdaIntegration: LambdaIntegration;


    public constructor(stack: Stack, props: TableProps){
        // injecting parameters into consturctor
        
        this.stack = stack;
        this.props = props;
        this.initialize();
        
    }

    // initializor method
    private initialize(){
        this.createTable();
        this.createLambdas();
        this.grantTableRights();
        
    }
    private createTable(){
        this.table = new Table(this.stack, this.props.tableName,{
            partitionKey: {
                name: this.props.primaryKey,
                type: AttributeType.STRING
            },
            tableName: this.props.tableName
        })

    }
    private createLambdas(){
        if(this.props.createLambdaPath){
            this.createLambda = this.createsingleLambda(this.props.createLambdaPath)
            this.createLambdaIntegration = new LambdaIntegration(this.createLambda);
        }
        if (this.props.readLambdaPath){
            this.readLambda = this.createsingleLambda(this.props.readLambdaPath)
            this.readLambdaIntegration = new LambdaIntegration(this.readLambda);
        }
        if (this.props.updateLambdaPath){
            this.updateLambda = this.createsingleLambda(this.props.updateLambdaPath)
            this.updateLambdaIntegration = new LambdaIntegration(this.updateLambda);
        }
        if (this.props.deleteLambdaPath){
            this.deleteLambda = this.createsingleLambda(this.props.deleteLambdaPath)
            this.deleteLambdaIntegration = new LambdaIntegration(this.deleteLambda);
        }

    }

    private grantTableRights(){
        if(this.createLambda){
            this.table.grantWriteData(this.createLambda);
        }
        if(this.readLambda){
            this.table.grantReadData(this.readLambda);
        }
        if(this.updateLambda){
            this.table.grantWriteData(this.updateLambda);
        }
        if(this.deleteLambda){
            this.table.grantWriteData(this.deleteLambda);
        }
    }

    private createsingleLambda(LambdaName: string): NodejsFunction{
        const lambdaId = `${this.props.tableName}-${LambdaName}`
        return new NodejsFunction(this.stack, lambdaId,{
            entry: (join(__dirname, '..', 'Services', this.props.tableName, `${LambdaName}.ts`)),
            handler: 'handler',
            functionName: lambdaId,
            environment: {
                TABLE_NAME: this.props.tableName,
                PRIMARY_KEY: this.props.primaryKey
            }
        })
    }

}