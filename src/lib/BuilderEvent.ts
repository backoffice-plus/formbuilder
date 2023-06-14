import type {ToolInterface} from "./models";
import type {ToolFinder} from "./ToolFinder";
import _ from "lodash";

export class BuilderEvent {

    readonly type: string | 'added' | 'removed' | 'modal' | 'mounted' | 'moved' | undefined;
    readonly tool: ToolInterface;
    readonly parentTool: ToolInterface | undefined;
    readonly childs: ToolInterface[] = [];
    readonly newIndex: number | undefined;
    readonly oldIndex: number | undefined;

    readonly showBuilder: 'schema' | 'uischema';

    readonly props: any;
    readonly schemaOnly: boolean = false;
    readonly schemaReadOnly: boolean = false;

    readonly baseUiTool: ToolInterface | undefined;
    readonly baseSchemaTool: ToolInterface | undefined;
    readonly toolFinder: ToolFinder;

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

        this.showBuilder = showBuilder;

        this.props = props;
        this.schemaOnly = !!props.schemaOnly;
        this.schemaReadOnly = !!props.schemaOnly;

        this.baseUiTool = baseUiTool;
        this.baseSchemaTool = baseSchemaTool;
        this.toolFinder = toolFinder;
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
}
