export { default as ElementHeadOrToolIcon } from './components/tools/utils/ElementHeadOrToolIcon.vue'
export { default as Actions } from './components/tools/utils/Actions.vue'

//lib
export {initElementsByToolProps, createJsonForms, createJsonUiSchema, findLayoutTool, getChildComponents} from './lib/formbuilder';
export { layoutTools, controlTools  } from './lib/formbuilder';
export { getComponent } from './lib/tools/toolImporter';
export { jsonFormRenderes } from './lib/renderer/renderers';
export {ToolProps, updatableUischemaKeys, updatableSchemaKeys} from "./lib/models";


//components
export { default as ResizeArea } from './components/ResizeArea.vue';
export { default as FormBuilder } from './components/FormBuilder.vue';
export { default as FormBuilderBar } from './components/FormBuilderBar.vue';
export { default as FormBuilderDetails } from './components/FormBuilderDetails.vue';
export { default as OptionModal } from './components/OptionModal.vue';
export { default as SchemaCode } from './components/SchemaCode.vue'
export { default as FlexArea } from './components/tools/flexArea.vue'

import mitt from 'mitt'
type Events = {
    formBuilderModal: any,
    formBuilderUpdated: any,
    formBuilderSchemaUpdated: any,
};
export const emitter = mitt<Events>();
