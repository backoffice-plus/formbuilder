import type {ToolInterface} from "./models";
import type {ToolFinder} from "./ToolFinder";
import _ from "lodash";

export class BuilderEvent {

    readonly type: string | 'added' | 'removed' | 'modal' | 'mounted' | 'moved' | undefined;
    readonly tool: ToolInterface;
    readonly parentTool: ToolInterface | undefined;
    readonly exParents = {} as { schemaParent: ToolInterface | undefined, uiParent: ToolInterface | undefined };
    readonly childs: ToolInterface[] = [];
    readonly newIndex: number | undefined;
    readonly oldIndex: number | undefined;
    readonly unscope: boolean = false;

    readonly showBuilder: 'schema' | 'uischema';

    readonly props: any;
    readonly schemaOnly: boolean = false;
    readonly schemaReadOnly: boolean = false;

    readonly baseUiTool: ToolInterface | undefined;
    readonly baseSchemaTool: ToolInterface | undefined;
    readonly toolFinder: ToolFinder;

    readonly displaceType: string | undefined;

    constructor(e: any, props:any, showBuilder: 'schema' | 'uischema', toolFinder: ToolFinder, baseUiTool: ToolInterface | undefined, baseSchemaTool: ToolInterface | undefined) {

        const knownKeys = ['added', 'removed', 'modal', 'mounted', 'moved'];
        const eventKeys = Object.keys(e);
        const intersect = _.intersection(knownKeys, eventKeys)

        this.type = intersect[0];
        const action = this.type && e[this.type] as any;
        if(!action || !action?.element) {
            throw "can not create BuilderEvent. Unknown action or element"
        }

        this.tool = action?.element;
        this.parentTool = action?.parentTool;
        this.childs = action?.childs;
        this.newIndex = action?.newIndex;
        this.oldIndex = action?.oldIndex;
        this.unscope = action?.unscope;

        this.showBuilder = showBuilder;

        this.props = props;
        this.schemaOnly = !!props.schemaOnly;
        this.schemaReadOnly = !!props.schemaOnly;

        this.baseUiTool = baseUiTool;
        this.baseSchemaTool = baseSchemaTool;
        this.toolFinder = toolFinder;

        this.exParents = {
            schemaParent: this.tool.edge.schemaParent,
            uiParent: this.tool.edge.uiParent,
        }
        const wasUnscoped = this.tool.edge.wasUnscoped;
        this.tool.edge.wasUnscoped = undefined;

        this.displaceType = 'added' === this.type && !wasUnscoped ? this.createUiDisplaceType() : undefined

        //update current childs to edge (must happend AFTER createUiDisplaceType());
        if (this.parentTool && this.childs) {
            this.parentTool.edge.replaceChilds(this.childs);
        }
    }

    createSubevent(e:any, props:any|undefined=undefined): BuilderEvent {
        return new BuilderEvent(
            e,
            props ?? this.props,
            this.showBuilder,
            this.toolFinder,
            this.baseUiTool,
            this.baseSchemaTool,
        )
    }

    private createUiDisplaceType(): string | undefined {

        /**
         * Layout->Layout
         *   - exParents: [schema:BaseSchema, ui:Layout]
         *
         * Layout->Object
         *   - exParents: [schema:BaseSchema, ui:Layout]
         *   - target: [ui:Control]
         *
         * Object->Layout
         *   - exParents: [schema:Object, ui:undefined]
         *   - target: [ui:Layout]
         *
         * Object->Object
         *   - exParents: [schema:Object, ui:undefined]
         */
        const exParents = this.exParents;
        const hasExUiParent = undefined !== exParents.uiParent;
        const hasExSchemaParent = undefined !== exParents.schemaParent;
        const targetUischema = this.parentTool?.uischema;

        const type: { from: string | undefined, to: string | undefined } = {from: undefined, to: undefined};

        if (hasExUiParent) {
            type.from = 'layout'
        } else if (hasExSchemaParent && 'object' === exParents.schemaParent?.schema?.type) {
            type.from = 'object'
        }

        const target = this.parentTool;
        if (target && undefined !== target?.uischema?.type) {
            type.to = 'Control' === targetUischema?.type ? 'object' : 'layout';
        }

        return type.from && type.to ? type.from + "->" + type.to : undefined
    };
}
