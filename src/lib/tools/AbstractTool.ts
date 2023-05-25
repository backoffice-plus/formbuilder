import type {JsonSchema} from "@jsonforms/core";
import type {RankedTester} from "@jsonforms/core/src/testers/testers";
import type {JsonFormsInterface, JsonFormsUISchema, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import _ from "lodash";

export abstract class AbstractTool implements ToolInterface {

    private _uuid: string|undefined;
    propertyName: string = 'Unknown';
    isRequired: boolean = false;//neccesary because required is stored in parentNode

    childs: ToolInterface[] = [];
    parentTool:ToolInterface|undefined = undefined;
    scopeTool:ToolInterface|undefined = undefined;
    uiTool:ToolInterface|undefined = undefined;

    //from props
    schema: JsonSchema = {};
    uischema: JsonFormsUISchema|any;

    constructor(uischemaType: string = 'Unknown') {
        this.uischema = {
            type: uischemaType
        } as JsonFormsUISchema;
    }

    get uuid(): string {
        if(!this._uuid) {
            //:TODO find better random id
            //this.uuid = crypto.randomUUID();
            this._uuid = String(Date.now().toString(32) + Math.random().toString(16)).replace(/\./g, '');
        }
        return this._uuid;
    }

    abstract clone(): ToolInterface;

    abstract importer(): any;

    abstract optionDataPrepare(context: ToolContext): Record<string, any> ;

    abstract optionDataUpdate(context: ToolContext, data: Record<string, any>): void;

    abstract optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined>;

    abstract tester: RankedTester | undefined;

    toolbarOptions(): Record<string, any> {
        return {}
    }

    generateJsonSchema(): JsonSchema|undefined {
        return this.schema
    }
    generateUiSchema(): JsonFormsUISchema|undefined {
        const uischema = _.cloneDeep(this.uischema);
        if(_.isEmpty(uischema.options)) {
            delete uischema.options;
        }
        return uischema;
    }
    initChilds(toolFinder: ToolFinderInterface): ToolInterface[] {
        return []
    }
}
