import type {JsonSchema} from "@jsonforms/core";
import type {RankedTester} from "@jsonforms/core";
import type {JsonFormsInterface, JsonFormsUISchema, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import _ from "lodash";
import {ToolEdge} from "../ToolEdge";

export abstract class AbstractTool implements ToolInterface {

    private readonly _uuid: string;
    propertyName: string = 'Unknown';
    isRequired: boolean = false;//neccesary because required is stored in parentNode

    edge: ToolEdge;

    /** @deprecated use edge.childs **/
    get childs() {
        return this.edge.childs;
    }
    /** @deprecated use edge.childs **/
    set childs(childs:ToolInterface[]) {
        this.edge.replaceChilds(childs);
    }

    //from props
    schema: JsonSchema = {};
    uischema: JsonFormsUISchema|any;

    constructor(uischemaType: string = 'Unknown') {
        this.edge = new ToolEdge(this as ToolInterface);
        this.uischema = {
            type: uischemaType
        } as JsonFormsUISchema;
        this._uuid = String(Date.now().toString(32) + Math.random().toString(16)).replace(/\./g, '');
    }

    get uuid(): string {
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
    initChilds(toolFinder: ToolFinderInterface, baseSchemaTool: ToolInterface | undefined = undefined): ToolInterface[] {
        return []
    }
}
