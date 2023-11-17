<template>

  <div class="container max-w-screen-lg mx-auto p-4 flex flex-col gap-4">

    <div class="styleA">
      Select Example:
      <select v-model="example" style="width:auto;display:inline" >
        <option></option>
        <option v-for="e in examples" :value="e.name">{{e.label}}</option>
      </select>
      <a :href="'#/jsonforms?example=' + example" v-if="example" class="ml-1 text-sm">[open Jsonforms]</a><br>

      <div>
        Schema Only: <input type="checkbox" v-model="schemaOnly" />
        <template v-if="schemaOnly">
          use schema Tool: <input type="checkbox" v-model="schemaBaseTool" />
          Auto Uischema: <input type="checkbox" v-model="schemaOnlyAutoUischema" /><br>
        </template>
        <br>
        <template v-if="example">
          Schema ReadOnly: <input type="checkbox" v-model="schemaReadOnly" />
        </template>
      </div>
    </div>

      <FormBuilder
          :jsonForms="jsonForms"
          :jsonFormsRenderers="jsonFormsRenderers"
          :schemaOnly="schemaOnly"
          :schemaReadOnly="schemaReadOnly"
          :tools="tools"
          :key="example + (schemaOnly?'schemaonly':'') + (schemaReadOnly?'readonly':'') + (schemaBaseTool?'schema':'')"
          :schemaTool="schemaBaseTool ? 'schema' : ''"
          @schemaUpdated="onSchemaUpdated"
          ref="fb"
      />
    <!--            -->
      <details>
          <summary class="cursor-pointer">ToolTree</summary>
          <div class="flex gap-4 text-xs">
              <div>
                  Schema:
                  <IdList :tool="baseSchemaTool" v-if="baseSchemaTool" />
              </div>
              <div>UI:
                  <IdList :tool="baseUiTool" v-if="baseUiTool" />
              </div>
          </div>
      </details>

    <FormBuilderDetails :jsonForms="jsonFormsResolved" :open="'true'" />

    <details v-if="example && !schemaReadOnly">
      <summary class="cursor-pointer">JSON Render Diff</summary>
      <ExampleVsSchemaCode
          :example="latestExampleData"
          :jsonforms="latestSchemaAfterExampleData"
          :key="example + (schemaOnly?'schemaonly':'') + (schemaReadOnly?'readonly':'')"
          v-if="latestSchemaAfterExampleData?.schema"
      />
    </details>

  </div>

</template>

<style>
.formbuilder nav {
 box-shadow: 0px 8px 8px -8px rgb(30, 30, 30, 30%);
  z-index:9;
 @apply
 sticky top-0 pt-2
}

</style>

<script setup lang="ts">

import {defaultTools, FormBuilder} from "../src/index.ts";
import FormBuilderDetails from "./FormBuilderDetails.vue";
import {computed, onMounted, ref, unref, watch} from "vue";
import * as ownExamples from "./jsonForms/examples";
import {schema as vuetifySchema, uischema as vuetifyUischema} from "./jsonForms/vuetifyOptions";
import {getExamples} from '@jsonforms/examples/src'
import {Generate, generateDefaultUISchema, generateJsonSchema, JsonSchema} from "@jsonforms/core";
import {resolveSchema} from "../src";
import {getExampleFromUrl, getKeyFromUrl, getUrl} from "./lib";
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {boplusVueVanillaRenderers} from "../src/index";
import SchemaCode from "./SchemaCode.vue";
import ExampleVsSchemaCode from "./ExampleVsSchemaCode.vue";
import _ from "lodash";
import {formbuilderRenderers} from "../src/components/renderers";
import IdList from "./Dev/IdList.vue";
import {getFormbuilder} from "../src/lib/vue";

const tools = [
    ...defaultTools,
]

const jsonFormsRenderers = Object.freeze([
  ...vanillaRenderers,
  ...boplusVueVanillaRenderers,
  ...formbuilderRenderers,
]);

const oe = ownExamples;//import own examples

const url = computed(() => getUrl());
const examples = computed(() => getExamples().sort((a,b)=>a.label.toLowerCase()>b.label.toLowerCase()?1:-1));
const example = ref(getExampleFromUrl());
const schemaReadOnly = ref("1" === getKeyFromUrl('schemaReadOnly'));
const schemaOnly = ref("1" === getKeyFromUrl('schemaOnly'));
const schemaOnlyAutoUischema = ref("1" === getKeyFromUrl('schemaOnlyAutoUischema'));
const schemaBaseTool = ref("1" === getKeyFromUrl('schemaBaseTool'));
const jsonFormsResolved = ref({});
const latestExampleData = ref({});
const latestSchemaAfterExampleData = ref(null);

const fb = ref(null);
const baseUiTool = computed(() => fb.value?.baseUiTool);
const baseSchemaTool = computed(() => fb.value?.baseSchemaTool);

const rootSchema = ref();
const rootUiSchema = ref();
const onSchemaUpdated = (jsonForms) => {
  rootSchema.value = jsonForms.schema;
  rootUiSchema.value = jsonForms.uischema;

  if(schemaOnly.value && schemaOnlyAutoUischema.value) {
    //jsonForms.uischema = {type:"Control",scope:"#"}
    jsonForms.uischema = Generate.uiSchema(rootSchema.value);
  }

  jsonFormsResolved.value = unref(jsonForms);
}

const jsonForms = computed(() => {
  let exampleData = {schema:undefined, uischema:undefined} as any;

  if(example.value) {
    exampleData = getExamples().find(item => item.name===example.value) as any;
    exampleData = JSON.parse(JSON.stringify(exampleData)); //clone


    if(exampleData) {
      if (!exampleData?.schema) {
        exampleData.schema = generateJsonSchema({});
      }

      if(false === exampleData?.uischema) {
        if(!schemaOnly.value) {
          exampleData.uischema = generateDefaultUISchema(exampleData.schema)
        }
      }
      else {
          //:TODO only clean uischema if option is set (or add "auto" option -> generateDefaultUISchema())
        if(exampleData?.uischema && schemaReadOnly.value) {
          exampleData.uischema = {
              type:'VerticalLayout'
          };
        }

        if(!exampleData?.uischema && !schemaReadOnly.value) {
          console.log("sandbox app","UiSschema generated because example is empty");
          exampleData.uischema = generateDefaultUISchema(exampleData.schema)
        }
      }

      //:DEV
      // const output = [];
      // const p = exampleData.schema.properties;
      // Object.keys(p).map(key => {
      //   output.push([key,p[key].type ?? p[key]['$ref']])
      // })
      // console.table(output)
    }
  }
  else {
    const schema = schemaOnly.value ? {} : generateJsonSchema({}) as JsonSchema|any;
    const uischema = generateDefaultUISchema(schema);
    if("additionalProperties" in schema) {
      delete schema.additionalProperties;
    }

    exampleData = {schema: schema, uischema: uischema};
  }

  if(schemaOnly.value) {
    //delete exampleData.uischema;
  }


  latestExampleData.value = unref(exampleData);
  latestSchemaAfterExampleData.value = null;

  return exampleData
});

const updateJsonFormDebounced = _.debounce((a) => {
  latestSchemaAfterExampleData.value = {schema:rootSchema.value,uischema:rootUiSchema.value};
},300,{leading:false, trailing:true})


watch(() => jsonForms.value, async () => {
  jsonFormsResolved.value = unref(jsonForms.value);
  //jsonFormsResolved.value.schema = await resolveSchema(jsonFormsResolved.value.schema);
})
watch(() => rootSchema.value, async (a,b) => {
  updateJsonFormDebounced(a);
});

const createUrl = () => {
  const params = {
    example: example.value ?? undefined,
    schemaOnly: schemaOnly.value ? "1" : undefined,
    schemaOnlyAutoUischema: schemaOnlyAutoUischema.value ? "1" : undefined,
    schemaReadOnly: schemaReadOnly.value ? "1" : undefined,
    schemaBaseTool: schemaBaseTool.value ? "1" : undefined,
  }
  return new URLSearchParams(_.omitBy(params, _.isEmpty));
};

watch(() => example.value, async () => {
  window.location.hash = "/?"+ createUrl()
})
watch(() => schemaOnly.value, async () => {
  if(schemaOnly.value) {
    schemaReadOnly.value = false;
  }
  else {
      schemaBaseTool.value = false;
  }
  window.location.hash = "/?"+ createUrl()
})
watch(() => schemaOnlyAutoUischema.value, async () => {
  onSchemaUpdated({schema:rootSchema.value,uischema:rootUiSchema.value})
  window.location.hash = "/?"+ createUrl()
})
watch(() => schemaReadOnly.value, async () => {
  if(schemaReadOnly.value) {
    schemaOnly.value = false;
  }
  window.location.hash = "/?"+ createUrl()
})
watch(() => schemaBaseTool.value, async () => {
    window.location.hash = "/?"+ createUrl()
})

// emitter.on('afterOptionJsonforms', (event: EventAfterOptionJsonforms) => {
//   const tool = event.tool;
//
//   if('Control' === tool.uischema?.type) {
//     _.merge(event.schema, vuetifySchema);  //merge into schema
//     event.uischema.elements.push(vuetifyUischema); //attach tab
//   }
// })

</script>
