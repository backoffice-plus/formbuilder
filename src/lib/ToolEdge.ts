import type {ToolInterface} from "./models";

export class ToolEdge {

    readonly tool: ToolInterface;
    private _childs: ToolInterface[] = [];

    private _uiParent: ToolInterface | undefined = undefined;
    private _schemaParent: ToolInterface | undefined = undefined;

    exUiParent: ToolInterface | undefined = undefined;
    exSchemaParent: ToolInterface | undefined = undefined;

    displaced: boolean | undefined = undefined;
    childsInitialized: boolean | undefined = undefined; //to prevent that once initiated properties/elements (with tool.initChilds() are initiated again

    constructor(tool: ToolInterface) {
        this.tool = tool;
    }

    get childs(): ToolInterface[] {
        return this._childs;
    }

    addChild(child: ToolInterface, newIndex: number = 0): void {
        this._childs = this._childs.filter(tool => tool.propertyName !== child.propertyName);
        this._childs.push(child);

        //:TODO newIndex

        //console.log("ADD CHILD", child.uuid.slice(-6) + " -+++-> " + this.tool.uuid.slice(-6));
    }

    replaceChilds(childs: ToolInterface[]): void {
        this._childs = childs;
    }

    removeChild(child: ToolInterface): void {
        this._childs = this._childs.filter(tool => tool.propertyName !== child.propertyName);

        //console.log("DEL CHILD", child.uuid.slice(-6) + " -xxx-> " + this.tool.uuid.slice(-6));
    }


    get uiParent(): ToolInterface | undefined {
        return this._uiParent;
    }

    get schemaParent(): ToolInterface | undefined {
        return this._schemaParent;
    }

    setParent(tool: ToolInterface | undefined) {
        const isControl = 'Control' === tool?.uischema?.type
        if(tool) {
            if(isControl) {
                this._schemaParent = tool;
            }
            else {
                this._uiParent = tool;
            }
        }
    }

    set uiParent(value: ToolInterface | undefined) {
        const replace = value && this._uiParent && value?.uuid !== this._uiParent?.uuid;
        replace && (this.exUiParent = this._uiParent);
        this._uiParent = value;
    }

    set schemaParent(value: ToolInterface | undefined) {
        const replace = value && this._schemaParent && value?.uuid !== this._schemaParent?.uuid;
        replace && (this.exSchemaParent = this._schemaParent);
        this._schemaParent = value;
    }
}
