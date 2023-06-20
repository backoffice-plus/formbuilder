import type {ToolInterface} from "./models";

export class ToolEdge {

    readonly tool: ToolInterface;
    private _childs: ToolInterface[] = [];

    private _uiParent: ToolInterface | undefined = undefined;
    private _schemaParent: ToolInterface | undefined = undefined;

    wasUnscoped: boolean|undefined = undefined;
    displaced: ToolInterface | undefined = undefined; //to ignore the "removed" event after "added" event
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

        // const idA = child.uuid.slice(-6);
        // const idB = this.tool.uuid.slice(-6);
        // console.log("%cADD CHILD"+ "%c"+idA +"%c -+++-> %c"+idB,
        //     "background-color:green;color:white","color:white;background-color:#"+idA,'color:black',"color:white;background-color:#"+idB);

        const isControl = 'Control' === this.tool?.uischema.type;
        if(isControl) {
            child.edge.schemaParent = this.tool;
        }
        else {
            child.edge.uiParent = this.tool;
        }
    }

    findChild(path:string): ToolInterface|undefined {
        const splits = path.split('.');
        if(splits.length > 1) {
            let currentEdge = this as ToolEdge;
            return splits.map(subPath => {
                const result = currentEdge._childs.find(tool => tool.propertyName === subPath);
                if(result) {
                    currentEdge = result.edge;
                }
                return result;
            }).pop();
        }
        else {
            return this._childs.find(tool => tool.propertyName === path);
        }
    }

    findScopedChilds(): ToolInterface[] {
        const results: ToolInterface[] = [];

        this._childs.forEach(child => {
            if(child.edge.schemaParent) {
                results.push(child)
            }
            results.push(...child.edge.findScopedChilds())
        });
        return results;
    }

    replaceChilds(childs: ToolInterface[]): void {
        this._childs = childs;
        const isControl = 'Control' === this.tool?.uischema.type;
        childs.forEach(child => {
            if(isControl) {
                child.edge._schemaParent = this.tool;
            }
            else {
                child.edge._uiParent = this.tool;
            }
        })
        //childs.forEach(child => this.addChild(child));
    }

    removeChild(child: ToolInterface): void {
        const hasChild = this._childs.find(tool => tool.propertyName !== child.propertyName);
        this._childs = this._childs.filter(tool => tool.propertyName !== child.propertyName);

        const idA = child.uuid.slice(-6);
        const idB = this.tool.uuid.slice(-6);
        // console.log("%cDEL CHILD"+ "%c"+idA +"%c -xxx-> %c"+idB,
        //     "background-color:red;color:white","color:white;background-color:#"+idA,'color:black',"color:white;background-color:#"+idB,
        //     {hasChild:!!hasChild});


        child.edge.removeParent(this.tool);
    }


    get uiParent(): ToolInterface | undefined {
        return this._uiParent;
    }

    get schemaParent(): ToolInterface | undefined {
        return this._schemaParent;
    }

    removeParent(parent:ToolInterface):void {
        console.log("Edge.removeParent", {
            parent:parent?.uuid,
            uiParent:this.uiParent?.uuid,
            schemaParent:this.schemaParent?.uuid,
        })
        if(this.uiParent?.uuid === parent?.uuid) {
            this.uiParent = undefined;
        }
        if(this.schemaParent?.uuid === parent?.uuid) {
            this.schemaParent = undefined;
        }
    }

    setParent(tool: ToolInterface) {
        const isControl = 'Control' === tool?.uischema?.type
        if(isControl) {
            this._schemaParent = tool;
        }
        else {
            this._uiParent = tool;
        }
    }

    set uiParent(value: ToolInterface | undefined) {
        this._uiParent = value;

        // const idA = this.tool.uuid.slice(-6);
        // const idB = value?.uuid.slice(-6);
        // console.log("%cSET UIPARENT "+ "%c"+idA +"%c.uiParent=%c"+(idB??"undefined"),
        //     'background-color:gray',"color:white;background-color:#"+idA,'color:black', (idB?"color:white;background-color:#"+idB:''));
    }

    set schemaParent(value: ToolInterface | undefined) {
        this._schemaParent = value;

        // const idA = this.tool.uuid.slice(-6);
        // const idB = value?.uuid.slice(-6) ?? "undefined";
        // console.log("%cSET SCHEMAPARENT "+ "%c"+idA +"%c.schemaParent=%c"+(idB??"undefined"),
        //     'background-color:gray',"color:white;background-color:#"+idA,'color:black',(idB?"color:white;background-color:#"+idB:''));
    }
}
