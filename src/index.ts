//lib
export * from './lib';

//components
export {default as FormBuilder } from './components/FormBuilder.vue';
export {default as FormBuilderBar } from './components/FormBuilderBar.vue';
export {default as FlexArea } from './components/tools/flexArea.vue'
export {default as ElementHeadOrToolIcon } from './components/tools/utils/ElementHeadOrToolIcon.vue'
export {default as ToolIcon } from './components/tools/utils/ToolIcon.vue'
export {default as Actions } from './components/tools/utils/Actions.vue'

//renderer
export {formbuilderRenderers} from "./components/renderers";

import boplusJsonfromsVueVanilla from "@backoffice-plus/jsonforms-vue-vanilla";
export const boplusVueVanillaRenderers = boplusJsonfromsVueVanilla;

export {default as Vuedraggable} from "vuedraggable";

import './css/theme.css'
