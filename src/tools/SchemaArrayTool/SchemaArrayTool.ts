import {type JsonSchema, UISchemaElement} from "@jsonforms/core";
import {AbstractTool, cloneEmptyTool, JsonFormsUISchema, ToolFinderInterface} from "@/";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "@/";
import toolComponent from "./schemaArray.component.vue";
import * as _ from "lodash-es";

export class SchemaArrayTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    clone = (): ToolInterface => new SchemaArrayTool();

    keyword: string|undefined;

    optionDataPrepare(context: ToolContext): Record<string, any> {
        const keywords = Object.keys(this.schema);

        this.keyword = keywords?.[0];

        return {
            keyword: this.keyword
        };
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {};
    }

    generateJsonSchema(): JsonSchema | undefined {
        const schemas = this.edge.childs.map(child => child.generateJsonSchema());

        if(!this.keyword) {
            return;
        }

        /**
         * :TODO how to clean a keyword?!?!
         */
        if(!schemas.length) {
            return {
                [this.keyword]: [{"default":false}],
            }
        }

        return {
            [this.keyword]: schemas,
        }
    }

    initChilds(toolFinder: ToolFinderInterface, baseSchemaTool: ToolInterface | undefined = undefined): ToolInterface[] {
        //for moving existing tools to another list
        if(this.edge.childs?.length || this.edge.childsInitialized) {
            return this.edge.childs;
        }

        const keyword = Object.keys(this.schema)?.[0];
        const schemas:JsonFormsInterface[] = this.schema?.[keyword]

        if(_.isEmpty(schemas)) {
            return [];
        }

        const uischema = {type:'Control',scope:'#'} as UISchemaElement;
        const schemaTools = toolFinder.getTypedTools().control;

        return schemas?.map(schema => {
            const matchingTool = toolFinder.findMatchingTool(baseSchemaTool?.schema ?? {}, schema, uischema, schemaTools);
            const clone = cloneEmptyTool(matchingTool, schema)

            clone.edge.setParent(this);
            clone.edge.replaceChilds(clone.initChilds(toolFinder));
            return clone
        })
    }


    toolbarOptions(): Record<string, any> {
        return {
            title: 'SchemaArrayTool',
            hideToolAtBar: true,
        }
    }

    static create() {
        return new SchemaArrayTool();
    }
}
