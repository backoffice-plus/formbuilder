import {controlTools, layoutTools} from "./lib/tools";


//lib
export * from './lib/formbuilder';
export * from './lib/generator';
export * from './lib/normalizer';
export {AbstractTool} from "./lib/tools/AbstractTool";
export type {ToolInterface, JsonFormsInterface} from "./lib/tools";
export const defaultTools = [...controlTools, ...layoutTools]

export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './lib/tools/schema/rule'
export { prepareOptionData as prepareOptionDataLabel, setOptionData as setOptionDataLabel } from './lib/tools/schema/labelAndI18n'
export { prepareOptionData as prepareOptionDataValidation, setOptionData as setOptionDataValidation } from './lib/tools/schema/validation'

//components
export { default as FormBuilder } from './components/FormBuilder.vue';
export { default as FormBuilderBar } from './components/FormBuilderBar.vue';
export { default as FlexArea } from './components/tools/flexArea.vue'
export { default as ElementHeadOrToolIcon } from './components/tools/utils/ElementHeadOrToolIcon.vue'
export { default as ToolIcon } from './components/tools/utils/ToolIcon.vue'
export { default as Actions } from './components/tools/utils/Actions.vue'

export {boplusVueVanillaRenderers} from "../packages/boplus-vue-vanilla/src/index";

export {emitter} from './lib/mitt'

export { useJsonforms } from './composable/jsonforms'

export {default as Vuedraggable} from "../packages/_vuedraggable/src/vuedraggable.js";
