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

    <template  v-if="currentBaseTool">
      <component :is="currentBaseTool.importer()"
                 :tool="currentBaseTool"
                 :isRoot="true"
                 class="my-4"
                 :key="currentBaseTool.propertyName"
      >

        <template v-slot:header  v-if="!schemaOnly && !schemaReadOnly">
          <div class="toolSwitcher">
            <ToolIcon :tool="baseUiTool" :prefixLabel="'uischema: '" :class="{active:showBuilder==='uischema'}" @click="onChangeBuilderByTab('uischema')" />
            <ToolIcon :tool="baseSchemaTool" :prefixLabel="'schema: '" :class="{active:showBuilder==='schema'}"  @click="onChangeBuilderByTab('schema')" />
          </div>
        </template>

      </component>
    </template>

  </div>

</template>

<style scoped>
nav {
  background-color: var(--toolBar-bg);
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
import {computed, ref, unref, onMounted, onBeforeUnmount, onBeforeMount, nextTick} from 'vue'
import {
  FormBuilderBar,
  createJsonForms,
  findAllProperties,
  findAllScopes,  generateSchemaByTool,
} from "../index";
import {cloneToolWithSchema, createBaseTool, createSchemaTool} from "../lib/toolCreation";

import Modal from "./Modal.vue";
import {normalizePath, normalizeScope} from "../lib/normalizer";
import _ from "lodash";
import {generateDefaultUISchema} from "@jsonforms/core/src/generators/uischema";
import {generateJsonSchema} from "@jsonforms/core";
import {getFormbuilder, onDragGetTool} from "../lib/vue";
import {ToolFinder} from "../lib/ToolFinder";
import {SchemaTool} from "../lib/tools/SchemaTool";
import ToolIcon from "./tools/utils/ToolIcon.vue";
import {ObjectTool} from "../lib/tools/ObjectTool";
import FormBuilderToolbar from "./FormBuilderToolbar.vue";

const props = defineProps({
  schema:Object,
  jsonForms: Object,
  jsonFormsRenderers: Array,
  schemaOnly: Boolean,
  schemaReadOnly: Boolean,
  tools: Array,
  schemaTool: String,
})

const emit = defineEmits(['schemaUpdated']);

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
  initBaseTools();


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

  switch (showBuilder.value) {
    case 'schema':
      rootSchema.value = generateSchemaByTool(baseSchemaTool.value)
      //jsonFormsSchema.value = rootSchema.value; //:TODO why is jsonFormsSchema AND rootSchema? just use one?!
      //updateSchemaBuilder();
      if(baseUiTool.value) {
        baseUiTool.value.schema = rootSchema.value;
      }
      //baseUiTool.value.uischema = rootUischema.value;
      break;

    // case 'definitions':
    //   updateDefinitionBuilder();
    //   break;

    default:
      //updateUischemaBuilder();
      const {schema, uischema} = createJsonForms(baseUiTool.value, rootSchema.value, props.schemaReadOnly);
      rootSchema.value = schema;
      rootUischema.value = uischema;

      baseSchemaTool.value.schema = rootSchema.value;
      break;
  }


  //something changed?
  const rootSchemaAfter = JSON.stringify(rootSchema.value);
  const rootUischemaAfter = JSON.stringify(rootUischema.value);
  const schemaChanged = rootSchemaAfter!==rootSchemaBefore;
  const uischemaChanged = rootUischemaAfter!==rootUischemaBefore;

  const emitUpdated = schemaChanged || uischemaChanged || e.mounted || e.modal;
  if(emitUpdated) {
    emit('schemaUpdated', {schema: rootSchema.value, uischema: rootUischema.value})
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


const initBaseTools = () => {
  if(props.schemaOnly) {
    baseSchemaTool.value = createSchemaTool(rootSchema.value, props.schemaTool);
  }
  else {
    baseSchemaTool.value = cloneToolWithSchema(new ObjectTool(), rootSchema.value)
  }

  if(true !== props.schemaOnly) {
    if(props.schemaReadOnly) {
      baseUiTool.value = createBaseTool(toolFinder);
    }
    else {
      baseUiTool.value = createBaseTool(toolFinder, rootSchema.value, rootUischema.value);
    }
  }
}
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

onBeforeMount(() => {
  const fb = getFormbuilder();
  //console.log("FB.onBeforeMount", "root fb", fb)

  //init baseTool
  showBuilder.value = props?.schemaOnly ? 'schema' : 'uischema';
  rootSchema.value = props?.schema ?? props?.jsonForms?.schema;
  rootUischema.value = props?.jsonForms?.uischema;
  //initBaseTools();
  onChangeBuilder({target:{value:showBuilder.value}})
  if(props.schemaReadOnly) {
    showBar.value='properties';
  }


  //trigger update if there are no elements (that would emit 'formBuilderUpdated')
  const hasElements = (props.jsonForms?.uischema?.elements?.length ?? 0) > 0;
  if(!hasElements) {
    //console.log("FB.onBeforeMount","-> call updateJsonForm()")
    //updateJsonForm();
    emit('schemaUpdated', {init:true, schema: rootSchema.value, uischema: rootUischema.value})
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

