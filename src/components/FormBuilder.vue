<template>

  <div class="formbuilder">


    <Modal
        :tool="toolEdit"
        :jsonFormsRenderers="jsonFormsRenderers"

        @change="onChangeModal"
        @close="isModalOpen=false;toolEdit=null"

        v-if="isModalOpen && toolEdit"
    />

<!--    <div class="styleA" v-if="filteredBuilders.length>1">-->
<!--      Builder:-->
<!--      <select v-model="showBuilder" @change="onChangeBuilder" class="!w-auto !inline">-->
<!--        <option v-for="builder in filteredBuilders">{{ builder }}</option>-->
<!--      </select>-->
<!--    </div>-->

    <slot name="toolbar" v-if="!hideToolbar">
      <nav>

  <!--      <div class="tabs">-->
  <!--        <button @click="showBar='schema';" :class="{active:'schema'===showBar}" v-if="!schemaReadOnly">Controls</button>-->
  <!--        <button @click="showBar='uischema';" :class="{active:'uischema'===showBar}" v-if="showBuilder==='uischema'">Layout</button>-->
  <!--        <button @click="showBar='properties';" :class="{active:'properties'===showBar}" v-if="schemaReadOnly">Properties</button>-->
  <!--      </div>-->

            <FormBuilderToolbar
                :toolFinder="toolFinder"
                :schemaOnly="schemaOnly"
                :schemaReadOnly="schemaReadOnly"
                :showBuilder="showBuilder"
                @drag="e=>drag = !!e"
            />

      </nav>
    </slot>

    <slot name="droparea" v-if="!hideDroparea">
      <template  v-if="currentBaseTool">
        <component :is="currentBaseTool.importer()"
                   :tool="currentBaseTool"
                   :isRoot="true"
                   :key="currentBaseTool.propertyName"
                   v-bind="schemaToolProps"
        >

          <template v-slot:header  v-if="!schemaOnly && !schemaReadOnly">
            <div class="toolSwitcher">
              <ToolIcon :tool="baseUiTool" :prefixLabel="'uischema: '" :class="{active:showBuilder==='uischema'}" @click="onChangeBuilderByTab('uischema')" />
              <ToolIcon :tool="baseSchemaTool" :prefixLabel="'schema: '" :class="{active:showBuilder==='schema'}"  @click="onChangeBuilderByTab('schema')" />
            </div>
          </template>

        </component>
      </template>
    </slot>

  </div>

</template>

<style scoped>
.formbuilder {
    @apply flex flex-col gap-4
}
nav {
  ---background-color: var(--toolBar-bg);
  background-color: transparent;
}


.toolSwitcher {
  @apply flex gap-4 ml-2
}
.toolSwitcher .toolIcon.active {
  background-color: var(--dropArea);
  border-color: var(--toolItem-border);
  @apply border border-b-0
}
.toolSwitcher .toolIcon {

  @apply px-2 py-1 rounded-t cursor-pointer
}
.toolSwitcher .toolIcon:hover {
  background-color: var(--toolBar-tab-hover);
}
</style>

<style>
.toolSwitcher .toolIcon label {
  @apply cursor-pointer
}

</style>


<script setup>
import {computed, ref, unref, onMounted, onBeforeUnmount, onBeforeMount, nextTick, useSlots} from 'vue'
import {generateJsonSchemaByUi} from "../index";
import {cloneToolWithSchema, createBaseTool, initBaseTools} from "../lib/toolCreation";

import Modal from "./Modal.vue";
import {normalizePath, normalizeScope} from "../lib/normalizer";
import _ from "lodash";
import {generateDefaultUISchema} from "@jsonforms/core/src/generators/uischema";
import {generateJsonSchema} from "@jsonforms/core";
import {getFormbuilder, onDragGetTool} from "../lib/vue";
import {ToolFinder} from "../lib/ToolFinder";
import ToolIcon from "./tools/utils/ToolIcon.vue";
import {ObjectTool} from "../lib/tools/ObjectTool";
import FormBuilderToolbar from "./FormBuilderToolbar.vue";
import {formbuilderProps, toolComponentProps} from "../lib/models";

//const props = defineProps({...formbuilderProps()})
const props = defineProps({
  schema:Object,
  jsonForms: Object,
  jsonFormsRenderers: Array,
  schemaOnly: Boolean,
  schemaReadOnly: Boolean,
  tools: Array,
  schemaTool: String,
  schemaToolProps: Object,
})

const emit = defineEmits(['schemaUpdated']);
const slots = useSlots()
const slotToolbar = slots?.toolbar && slots.toolbar();
const slotDroparea = slots?.droparea && slots.droparea();
const hideToolbar = 0 === slotToolbar?.length
const hideDroparea = 0 === slotDroparea?.length

const drag = ref(false);
const jsonFormsUiSchema = ref(props?.jsonForms?.uischema);
const jsonFormsSchema = ref(props?.schema ?? props?.jsonForms?.schema);
const isModalOpen = ref(false);
const toolEdit = ref(null);
const showBuilder = ref('uischema');

const baseUiTool = ref(null);
const baseSchemaTool = ref(null);
//const baseDefinitionTool = ref(null);
//const currentBaseTool = ref(null);

const fb = getFormbuilder();

//expose
const toolFinder = new ToolFinder(props.tools);
const toolDragging = ref();
const onToolDrag = (e) => toolDragging.value = onDragGetTool(e);
const rootSchema = ref();
const rootUischema = ref();
const onEditTool = (data) => {
  isModalOpen.value = true;
  toolEdit.value = data.tool;
}
const onDropAreaChanged = (e) => {
  updateJsonFormDebounced(e);
};
defineExpose({toolFinder, showBuilder, toolDragging, onToolDrag, rootSchema, baseSchemaTool, rootUischema, onEditTool, onDropAreaChanged})


// const filteredBuilders = computed(() => {
//   const showBuilders = props.schemaOnly ? ['schema'] : ['schema','uischema'];
//   const allowedBuilders = ['schema','uischema'];//,'definitions'
//   return showBuilders ? showBuilders.filter(value => allowedBuilders.includes(value)) : allowedBuilders;
// })

//update(props.jsonForms?.schema, props.jsonForms?.uischema);


//:TODO there is a lot of renderings - how to optimize?
// onRenderTriggered((e) => {
//   console.log("FB.onRenderTriggered",e);
// });

const onChangeBuilderByTab = (builder) => {
  showBuilder.value = builder;
  onChangeBuilder({target:{value:builder}});
}

const currentBaseTool = computed(() => showBuilder.value === 'uischema' ? baseUiTool.value : baseSchemaTool.value)

const onChangeBuilder = (e) => {

  /**
   * :INFO after changing builder -> baseTools must be recreated to create new childs based on the new schema
   */
  const {schema, uischema} = initBaseTools(toolFinder, props, rootSchema.value, rootUischema.value)
  baseSchemaTool.value = schema;
  baseUiTool.value = uischema;


  // switch (e.target.value) {
  //   case 'schema':
  //     //showBar.value='schema';
  //
  //     //currentBaseTool.value = baseSchemaTool.value;
  //     break;
  //
  //   case 'uischema':
  //     //showBar.value='schema';
  //
  //     // //:TODO add property & scope changed check!
  //     //
  //
  //     //currentBaseTool.value = baseUiTool.value;
  //     break;
  //
  //   // case 'definitions':
  //   //   showBar.value='schema';
  //   //
  //   //   baseDefinitionTool.value = createDefTool(rootSchema.value);
  //   //   currentBaseTool.value = baseDefinitionTool.value
  //   //   break;
  // }
}



// const readonlyTools = computed(() => {
//
//   let all = [];
//
//
//   //:TODO find better solution!! use toolStore
//   if(props.schemaReadOnly) {
//
//     console.log("rootUischema",props.jsonForms.uischema);
//
//     const usedProps = findAllScopes(props.jsonForms.uischema).map(scope=>normalizePath(normalizeScope(scope)));
//
//     const allProps = findAllProperties(props.jsonForms.uischema);
//     const readOnlyControlTools = Object.keys(allProps)?.map(name => {
//
//       const itemSchema = allProps[name];
//       const itemUischema = {type:'Control',scope:'#'};
//
//       const clone = cloneToolWithSchema(toolFinder.findMatchingTool(rootSchema, itemSchema, itemUischema),  itemSchema, itemUischema)
//       clone.propertyName = name;
//
//       return clone;
//     }).filter(tool => !usedProps.includes(tool.propertyName))
//
//     all = [...readOnlyControlTools, ...all]
//   }
//
//   return all;
// });

const onChangeModal = (data) => {
  if (toolEdit.value) {
    // if(data.propertyName) {
    //   toolEdit.value.props.propertyName = data.propertyName;
    // }
    updateJsonForm({modal:{element:toolEdit.value}});
  }
}

const updateJsonForm = (e) => {

  //ignore "mounted" event for non-baseTools
  if(e.mounted && e.mounted?.element !== ('schema' === showBuilder.value ? baseSchemaTool : baseUiTool).value) {
      return;
  }

  const rootSchemaBefore = JSON.stringify(rootSchema.value);
  const rootUischemaBefore = JSON.stringify(rootUischema.value);

  if(props.schemaOnly) {
    rootSchema.value = baseSchemaTool.value.generateJsonSchema();
    rootUischema.value = undefined;
  }
  else {
      if('schema' === showBuilder.value) {
          rootSchema.value = baseSchemaTool.value.generateJsonSchema();
      }
      else {
          if(!props.schemaReadOnly) {
              rootSchema.value = generateJsonSchemaByUi(e, baseUiTool.value, baseSchemaTool.value, toolFinder );
          }
          rootUischema.value = baseUiTool.value.generateUiSchema();


          //this needed?
          baseSchemaTool.value.schema = rootSchema.value;
      }
  }

  // switch (showBuilder.value) {
  //   case '---schema':
  //     rootSchema.value = baseSchemaTool.value.generateJsonSchema()
  //     //jsonFormsSchema.value = rootSchema.value; //:TODO why is jsonFormsSchema AND rootSchema? just use one?!
  //     //updateSchemaBuilder();
  //     if(baseUiTool.value) {
  //       baseUiTool.value.schema = rootSchema.value;
  //     }
  //     //baseUiTool.value.uischema = rootUischema.value;
  //     break;
  //
  //   // case 'definitions':
  //   //   updateDefinitionBuilder();
  //   //   break;
  //
  //   default:
  //     //updateUischemaBuilder();
  //
  //
  //       //:TODO is that needed?!?!
  //     if (!rootSchema.value) {
  //       rootSchema.value = Generate.jsonSchema({})
  //       delete rootSchema.value.additionalProperties;
  //     }
  //
  //
  //     const {schema, uischema} = createJsonForms(baseUiTool.value, baseSchemaTool.value, rootSchema.value, props.schemaReadOnly);
  //     rootSchema.value = schema;
  //     rootUischema.value = uischema;
  //
  //     baseSchemaTool.value.schema = rootSchema.value;
  //     break;
  // }


  //something changed?
  const rootSchemaAfter = JSON.stringify(rootSchema.value);
  const rootUischemaAfter = JSON.stringify(rootUischema.value);
  const schemaChanged = rootSchemaAfter!==rootSchemaBefore;
  const uischemaChanged = rootUischemaAfter!==rootUischemaBefore;

  const emitUpdated = schemaChanged || uischemaChanged || e.mounted || e.modal;
  if(emitUpdated) {
    emitSchemaUpdated();
  }


  // console.log("FB.updateJsonForm","rootschema",{
  //   rootSchema:rootSchema.value,
  //   rootUischema:rootUischema.value
  // })
  // console.log("FB.updateJsonForm","baseToos",{
  //   baseSchemaTool:baseSchemaTool.value,
  //   baseUiTool:baseUiTool.value
  // })
}

// const updateSchemaBuilder = () => {
//   if (baseSchemaTool?.value) {
//     let setSchema;
//     if(baseSchemaTool.value instanceof SchemaTool) {
//       const firstChild = baseSchemaTool.value.childs[0];
//       setSchema = firstChild && generateSchemaByTool(firstChild);
//     }
//     else {
//       setSchema = createTypeObjectSchema(baseSchemaTool.value).schema
//
//       // const createSchema = createTypeObjectSchema(baseSchemaTool.value).schema;
//       // //setSchema = createSchema;//createTypeObjectSchema(baseSchemaTool.value).schema
//       // setSchema = createSchema;//baseSchemaTool.value?.schema ?? {};
//       // //console.log("FB.updateSchemaBuilder","setSchema",setSchema,"baseschemaTOol",baseSchemaTool.value)
//       // console.log("FB.updateSchemaBuilder", {createSchema})
//     }
//
//     rootSchema.value = setSchema
//   }
// }


// const updateDefinitionBuilder = () => {
//   if (baseDefinitionTool?.value) {
//     const def = createTypeObjectSchema(baseDefinitionTool.value);
//     console.log("def",def);
//
//     if (!_.isEmpty(def.definitions?.properties ?? {})) {
//       const updatedSchema = rootSchema.value
//       updatedSchema.definitions = def.definitions.properties;
//
//       rootSchema.value = updatedSchema
//       emit('schemaUpdated', {schema:updatedSchema, uischema:rootUischema.value})
//     }
//   }
// }

// const updateUischemaBuilder = () => {
//   let newJsonForms;
//
//   // if ('definition' === showBuilder.value) {
//   //   const def = createTypeObjectSchema(baseDefinitionTool.value);
//   //   newJsonForms = {
//   //     schema: jsonFormsSchema.value,
//   //     uischema: jsonFormsUiSchema.value,
//   //   }
//   //   if (!_.isEmpty(def.definitions?.properties ?? {})) {
//   //     newJsonForms.schema.definitions = def.definitions.properties;
//   //   }
//   //   else {
//   //     delete newJsonForms.schema.definitions;
//   //   }
//   // }
//
//   if ('uischema' === showBuilder.value) {
//     //newJsonForms = createJsonForms(baseUiTool.value, jsonFormsSchema.value, props.schemaReadOnly);
//     // jsonFormsSchema.value = newJsonForms.schema;
//     // jsonFormsUiSchema.value = newJsonForms.uischema;
//     newJsonForms = createJsonForms(baseUiTool.value, rootSchema.value, props.schemaReadOnly);
//     rootSchema.value = newJsonForms.schema;
//     rootUischema.value = newJsonForms.uischema;
//   }
//
//   // if (newJsonForms) {
//   //   rootSchema.value = jsonFormsSchema.value;
//   //   rootUischema.value = jsonFormsUiSchema.value;
//   //  // emit('schemaUpdated', newJsonForms)
//   // }
//
//   //emitter.emit('formBuilderSchemaUpdated', newJsonForms)
// }

// const rootForm = ref(null);
// const rootDefinitionForm = ref(null);
// const rootSchemaForm = ref(null);
// const setRootForm = (e) => rootForm.value = e
// const setRootDefinitionForm = (e) => rootDefinitionForm.value = e
// const setRootSchemaForm = (e) => rootSchemaForm.value = e

const updateJsonFormDebounced = (e) => _.debounce(() => {
  nextTick().then(() => updateJsonForm(e))
  // window.setTimeout(updateJsonForm, 100);
},100,{leading:false, trailing:true})()

const emitSchemaUpdated = (init=false) => {
    const args = {
        schema: JSON.parse(JSON.stringify(rootSchema.value)), //to remove undefined vars
        uischema: rootUischema.value
    };
    if(init) {
        args.init = true;
    }

    //do not emit schema={}
    if(_.isEmpty(args.schema)) {
        args.schema = undefined;
    }

    emit('schemaUpdated', args)
}

onBeforeMount(() => {
  //init baseTool
  showBuilder.value = props?.schemaOnly ? 'schema' : 'uischema';
  rootSchema.value = props?.schema ?? props?.jsonForms?.schema;
  rootUischema.value = props?.jsonForms?.uischema;
  onChangeBuilder({target:{value:showBuilder.value}})


  //trigger update if there are no elements (that would emit 'schemaUpdated')
  const hasElements = (rootSchema.value?.elements?.length ?? 0) > 0;
  const hasUiElements = (rootUischema.value?.elements?.length ?? 0) > 0;
  if(!hasUiElements && 'uischema' === showBuilder.value) {
    const currentBaseTool = ('schema' === showBuilder.value ? baseSchemaTool : baseUiTool).value;
    updateJsonForm({mounted:{element:currentBaseTool}});
    emitSchemaUpdated(true);
  }

  // emitter.on('formBuilderModal', (data) => {
  //   isModalOpen.value = true;
  //   toolEdit.value = data.tool;
  // })
  // emitter.on('formBuilderUpdated', (data) => {
  //   console.log("fb.formBuilderUpdated")
  //   updateJsonFormDebounced();
  // });
});
onBeforeUnmount(() => {
  //emitter.off('formBuilderModal');
  //emitter.off('formBuilderUpdated');
})

</script>

