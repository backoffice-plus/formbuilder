import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {and, rankWith} from "@jsonforms/core";
import {uiTypeIs} from "@jsonforms/core/src/testers/testers";
import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import toolComponent from "../../components/tools/combinator.component.vue";
import {resolveSchema} from "../formbuilder";
import {schema, uischema} from "./schema/combinator.form.json";
import _ from "lodash";
import {cloneToolWithSchema} from "../toolCreation";
import {getPlainProperty, getRequiredFromSchema} from "../normalizer";

export class CombinatorTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    tester = rankWith(2, and(uiTypeIs('Control'), (uischema, schema) => {
        const hasKeyword = undefined !== schema?.allOf || undefined !== schema?.anyOf || undefined !== schema?.oneOf;
        const noType = undefined === schema?.type
        return hasKeyword && noType
    }));
    clone = (): ToolInterface => new CombinatorTool(this.uischema.type);


    constructor(uischemaType: string = 'Unknown') {
        super(uischemaType);

        //:INFO do not set empty keyword (with cloneEmptyTool() schema is never set - therefore its always empty),
        // let keyword = CombinatorTool.getKeyword(this.schema);
        // if(undefined === keyword) {
        //     keyword = 'anyOf';
        //     this.schema.anyOf = [];
        // }
        //this.keyword = keyword;
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {

        return {
            propertyName: this.propertyName,
            keyword: CombinatorTool.getKeyword(this.schema),
            options: this.uischema?.options ?? {},
            type: this.schema?.type,
        } as any;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.propertyName = data?.propertyName ?? '';
        this.uischema && (this.uischema.scope = '#/properties/'+ this.propertyName);

        const keyword = data?.keyword;
        const keywordOld = CombinatorTool.getKeyword(this.schema);

        if(keyword && keywordOld && keyword !== keywordOld) {
            /** @ts-ignore **/
            this.schema[keyword] = this.schema[keywordOld] ?? [];
            /** @ts-ignore **/
            delete this.schema[keywordOld];
        }

        if(!keyword && !keywordOld) {
            this.schema['anyOf'] = []
        }

        this.schema.type = data?.type;
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    static getKeyword(schema: JsonSchema): 'oneOf' | 'allOf' | 'anyOf' | string | undefined {
        //if (schema?.oneOf && schema.oneOf?.length > 0) {
        if (undefined !== schema?.oneOf) {
            return 'oneOf';
        }
        //if (schema?.anyOf && schema.anyOf?.length > 0) {
        if (undefined !== schema?.anyOf) {
            return 'anyOf';
        }
        //if (schema?.allOf && schema.allOf?.length > 0) {
        if (undefined !== schema?.allOf) {
            return 'allOf';
        }
        return undefined;
    }

    static getKeywordSchemas(schema: JsonSchema): JsonSchema[] | undefined {
        const keyword = CombinatorTool.getKeyword(schema);
        /** @ts-ignore */
        return keyword && schema[keyword];
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Combinator',
            icon: 'mdi:arrow-decision',
            //icon: 'mdi:folder-pound',
            //  labelAtDropArea:this.keyword ?? 'anyOf',
            //hideToolAtBar: true,

        }
    }

    generateJsonSchema(): JsonSchema|undefined {
        const keyword = CombinatorTool.getKeyword(this.schema) as string;

        let schema = {
            ...this.schema,
        } as JsonSchema|any;

        if(keyword) {
            if(this.childs?.length) {
                schema[keyword] = this.childs?.map((childTool: ToolInterface) => {
                    return childTool.generateJsonSchema();
                });
            }
            else {
                //no empty combinators (otherwise jsonforms throws error)
                /** @ts-ignore */
                const schemas = this.schema[keyword];
                if(_.isEmpty(schemas)) {
                    schema[keyword] = [{}];
                }

                // //also for (@see https://jsonforms.io/docs/multiple-choice/#one-of)
                // else {
                //     return this.schema;
                // }
            }
        }

        return schema;
    }


    initChilds(toolFinder: ToolFinderInterface, baseSchemaTool: ToolInterface | undefined = undefined): ToolInterface[] {
        const ctools = [] as any;

        //for moving existing tools to another list
        if(this.edge.childs?.length || this.edge.childsInitialized) {
            return this.edge.childs;
        }

        /** @ts-ignore */
        const schemaOfKeyword = CombinatorTool.getKeywordSchemas(this.schema)

        schemaOfKeyword && schemaOfKeyword.forEach((itemSchema:JsonSchema) => {

            const uischema = {type:'Control',scope:'#'} as UISchemaElement;
            const clone = cloneToolWithSchema(toolFinder.findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)

            //required
            const required = getRequiredFromSchema(clone.propertyName, this.schema);
            if (required?.includes(getPlainProperty(clone.propertyName))) {
                clone.isRequired = true;
            }

            clone.edge.setParent(this);
            clone.edge.replaceChilds(clone.initChilds(toolFinder));

            ctools.push(clone);
        });

        return ctools;
    }
}

// @ts-ignore
export const combinatorTool = new CombinatorTool('Control');
