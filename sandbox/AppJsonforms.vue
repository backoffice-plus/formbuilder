<template>

  <div class="container max-w-screen-lg mx-auto p-4 flex flex-col gap-4">

    <div class="flex items-baseline gap-2"><h2>{{ example }}</h2></div>

    <div class="styleA">
      Select Example:
      <select v-model="example" class="inline" @input="onChangeExample" >
        <option></option>
        <option v-for="e in examples" :value="e.name">{{e.label}}</option>
      </select>
      <a :href="'#/?example='+ example" class=" text-sm">[back]</a>
    </div>

    <details open="true">
      <summary class="cursor-pointer">JsonForms</summary>
      <div class="card p-4 styleA">
        <JsonForms
            :schema="jsonForms.schema"
            :uischema="jsonForms.uischema"
            :data="jsonForms.data"
            :renderers="jsonFormRenderesMore"
            :config="{restrict:true}"
            :ajv="ajv"
            @change="r => jsonFormsUpdated=r"
        />
      </div>
    </details>

    <details open="true">
      <summary class="cursor-pointer">Data</summary>
      <div class="styleA flex gap-4">
        <textarea class="h-60 p-4" readonly disabled>{{ jsonFormsUpdated?.data }}</textarea>
        <textarea class="h-60 p-4 text-red-600" readonly disabled>{{ jsonFormsUpdated?.errors }}</textarea>
      </div>
    </details>

    <details open="true">
      <summary class="cursor-pointer">JSON</summary>
      <div class="card p-4">
        <SchemaCode
            v-model:schema="jsonForms.schema"
            v-model:uischema="jsonForms.uischema"
        />
      </div>
    </details>

  </div>

</template>

<style>

</style>


<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {JsonForms} from "@jsonforms/vue";
import {createAjv, generateDefaultUISchema, generateJsonSchema} from "@jsonforms/core";
import SchemaCode from './SchemaCode.vue'
import {getExamples} from "@jsonforms/examples/src";
import {getExampleFromUrl, getUrl} from "./lib";
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {boplusVueVanillaRenderers} from "../src/index";

const url = computed(() => getUrl());
const examples = computed(() => getExamples().sort((a, b) => a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1));
const example = ref(getExampleFromUrl());


// const jsonFormsSchema = schema;
// const jsonFormsUiSchema = uischema;
const jsonForms = ref({});
const jsonFormsData = ref({});
const jsonFormsUpdated = ref({});

const jsonFormRenderes = Object.freeze([
  ...vanillaRenderers,
  ...boplusVueVanillaRenderers,
]);

const onChangeExample = async (e) => {
    example.value = e.target.value
    jsonForms.value = await getExampleData(example.value)
}

onMounted(async () => {
    jsonForms.value = await getExampleData(example.value)
})

const getExampleData = async (exampleName) => {
    const exampleData = getExamples().find(item => item.name === exampleName);

    if (!exampleData?.schema) {
        exampleData.schema = generateJsonSchema({});
    }

    if (!exampleData?.uischema) {
        exampleData.uischema = generateDefaultUISchema(exampleData.schema)
    }

    return exampleData;
}

const jsonFormRenderesMore = Object.freeze([
  ...jsonFormRenderes,
]);

const ajv = createAjv();//is needed because reactive :schema & :uischema will throw error
watch(() => example.value, async () => {
  window.location.hash = example.value ? "/jsonforms?example="+example.value : '';
})
</script>

