// @ts-ignore
import lodashGet from 'lodash.get';
//const lodashGet = require('lodash/get');
import {
    JsonForms,
    Tool,
    ToolProps
} from "./models";
import type {
    JsonFormsSchema,
    JsonFormsUISchema,
} from "./models";

export const initElementsByToolProps = (toolProps:ToolProps): Array<any> => {
    const jsonFromSchema = toolProps.jsonForms?.schema ?? {};
    const jsonFormUischema = toolProps.jsonForms?.uischema ?? {};

    const pushableElements = [] as any;

    jsonFormUischema?.elements?.forEach((itemUischema:any) => {
        switch (itemUischema.type) {
            case 'Control':
                const propertyPath = itemUischema.scope.replaceAll('#/', '').replaceAll('/', '.');
                const itemSchema = lodashGet(jsonFromSchema, propertyPath);

                let tool = findControlTool(itemSchema, itemUischema);

                if(tool) {
                    //:TODO: support nested elements (#/properties/details/properties/name)
                    tool.props.propertyName = propertyPath.replace('properties.','');

                    pushableElements.push(tool);
                }
                break;

            default:
                const toolLayout = findLayoutTool(jsonFromSchema, itemUischema);
                if(toolLayout) {
                    pushableElements.push(toolLayout);
                }
                break;
        }
    });

    return pushableElements;
};

export const createJsonForms = (rootForm:any) : JsonForms => {
    const schema = {
        type: 'object',
        properties: {},
    } as JsonFormsSchema;

    return new JsonForms(
        schema,
        createJsonUiSchema(rootForm, schema)
    );
}

export const createJsonUiSchema = (refElm:any, schema:JsonFormsSchema) : JsonFormsUISchema => {
    refElm = refElm?.value ?? refElm;

    if(!refElm?.toolProps) {
        throw "refElm has no toolProps.";
    }

    const toolProps = refElm?.toolProps as ToolProps;

    const jsonForms = toolProps?.jsonForms.clone();

    const itemSchema = jsonForms.schema as JsonFormsSchema;
    const uischema = jsonForms.uischema as JsonFormsUISchema;

    const props = refElm?.data ?? {};

    switch (uischema.type) {
        case 'Control':
            const propName = props?.propertyName ?? "UNKNOWN";

            if(itemSchema.oneOf !== undefined && !itemSchema.oneOf.length) {
                itemSchema.oneOf = [{}];
            }
            if(itemSchema.enum !== undefined && !itemSchema.enum.length) {
                itemSchema.enum = [''];
            }

            uischema.scope = '#/properties/' + propName;

            if(undefined === schema.properties) {
                schema.properties = {};
            }
            schema.properties[propName] = itemSchema;

            if(props.required) {
                if(undefined === schema.required) {
                    schema.required = [];
                }
                schema.required?.push(propName);
            }
            break;

        case 'VerticalLayout':
        case 'HorizontalLayout':
        case 'Categorization':
        case 'Category':
        case 'Group':
            const childComponents = getChildComponents(refElm, null);

            const elements = refElm.elements.map((tool:Tool) => {
                if(!childComponents[tool.uuid]) {
                    throw "no child with uuid "+ tool.uuid +" found";
                }
                return createJsonUiSchema(childComponents[tool.uuid], schema)
            });
            uischema.elements = elements ?? [];
            // if (props?.label) {
            //     uischema.label = props.label;
            // }
            // if(!uischema.label && 'Category' === uischema.type) {
            //     uischema.label = 'Tab';
            // }
            break;
    }

    return uischema;
};

export const getChildComponents = (component:any, namePrefix:string|null) => {
    const childComponents = {} as Record<string, any>;

    const refs = Object.keys(component.$refs)
        .filter(key => key.includes(namePrefix ?? 'components') && component.$refs[key])
        .map(key => {
            let reff = component.$refs[key];
            if(reff.length) {
                reff = reff[0];
                if(1 < reff.length) {
                    throw "there are more then one $refs with key "+ key
                }
            }
            return reff;
        });

    refs.map(reff => {
        if(!reff.uuid)  {
            throw "no uuid in getChildComponents";
        }

        childComponents[reff.uuid] = reff
    })

    return childComponents;
};

export const findLayoutTool = (schema:JsonFormsSchema|undefined = undefined, itemUischema: JsonFormsUISchema) : Tool|undefined => {
    return [...layoutTools,...[tools.tab]]
        .find(comp => {
            return comp.props.jsonForms.uischema.type === itemUischema.type;
        })?.clone(schema, itemUischema);
}

export const findControlTool = (itemSchema:any, itemUischema:any) : Tool => {

    const elements = controlTools.map((itemForm, index) => {
        const schema = itemForm.props.jsonForms.schema;
        const uischema = itemForm.props.jsonForms.uischema;

        let score = 0;

        const sameType = schema.type === itemSchema?.type;
        const isString = 'string' === schema.type;
        if(sameType) {
            score++;

            const sameOptions = itemUischema?.options && JSON.stringify(uischema?.options) === JSON.stringify(itemUischema?.options);
            //console.log("options",JSON.stringify(uischema?.options) , JSON.stringify(itemUischema?.options),sameOptions);
            if(sameOptions) {
                score++;
            }

            if(isString) {
                if(schema?.enum !== undefined && itemSchema?.enum !== undefined) {
                    score++;
                }
                if(schema?.oneOf !== undefined && itemSchema?.oneOf !== undefined) {
                    score++;
                }
                if(schema?.format !== undefined && schema?.format === itemSchema?.format) {
                    score++;
                }
            }
        }

        return [index, score];
    });

    const sorted = elements.sort((a, b) => b[1] - a[1]);

    if(!controlTools[sorted[0][0]]) {
        throw "unknown tool";
    }

    return controlTools[sorted[0][0]]?.clone(itemSchema, itemUischema);
};

export const tools = {
    tab: new Tool('flexArea', ToolProps.create({
        toolType:'tab',
        jsonForms: {uischema: {type: 'Category'}}
    })),
};

export const layoutTools = [

    new Tool('flexArea', ToolProps.create({
        toolType:'flex',
        jsonForms: {uischema: {type: 'VerticalLayout'}}
    })),

    new Tool('flexArea', ToolProps.create({
        toolType:'flexRow',
        jsonForms: {uischema: {type: 'HorizontalLayout'}}
    })),

    new Tool('flexArea', ToolProps.create({
        toolType:'group',
        jsonForms: {uischema: {type: 'Group'}}
    })),

    new Tool('categorization', ToolProps.create({
      toolType:'tabs',
      jsonForms: {uischema: {type: 'Categorization'}}
    })),
];

export const controlTools = [

    new Tool('formInputByType', ToolProps.create({
        inputType: 'text',
        jsonForms: {schema:{type:'string'}, uischema:{type:'Control'}}
    })),

    new Tool('formInputByType', ToolProps.create({
        inputType: 'textarea',
        jsonForms: {schema:{type:'string'}, uischema:{type:'Control', options:{multi:true}}}
    })),

    new Tool('formInputByType', ToolProps.create({
        inputType: 'number',
        jsonForms: {schema:{type:'number'}, uischema:{type:'Control'}}
    })),

    new Tool('formInputByType', ToolProps.create({
        inputType: 'date',
        jsonForms: {schema:{type:'string', format: 'date'}, uischema:{type:'Control'}}
    })),

    new Tool('formInputByType', ToolProps.create({
        inputType: 'radio',
        jsonForms: {schema:{type:'string',enum:[]}, uischema:{type:'Control', options:{format:'radio'}}}
    })),

    new Tool('formInputByType', ToolProps.create({
        inputType: 'select',
        jsonForms: {schema:{type:'string',oneOf:[]}, uischema:{type:'Control'}}
    })),

    new Tool('formInputByType', ToolProps.create({
        inputType: 'checkbox',
        jsonForms: {schema:{type:'boolean'}, uischema:{type:'Control'}}
    })),

    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'file',
    //     jsonForms: {schema:{type:'string', format:'file'}, uischema:{type:'Control'}}
    // })),


    //try to solve with optionmodal
    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'number',
    //     jsonForms: {schema:{type:'integer'}, uischema:{type:'Control'}}
    // })),

    //renderer broken for date-time & time
    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'time',
    //     jsonForms: {schema:{type:'string', format: 'time'}, uischema:{type:'Control'}}
    // })),

    //no renderer for slider:true
    // new Tool('formInputByType', ToolProps.create({
    //   inputType: 'range',
    //   jsonForms: {schema:{type:'number'}, uischema:{type:'Control',options:{"slider": true }}}
    //   //{type: 'number',"minimum": 1,"maximum": 5, "default": 2}
    // })),
];
