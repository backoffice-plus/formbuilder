<template>

  <div class="formBuilderDetails">

    <details>
      <summary class="cursor-pointer">JSON</summary>
      <div class="card p-4">
        <SchemaCode
            v-model:schema="jsonFormsSchema"
            v-model:uischema="jsonFormsUiSchema"
        />
        <!--
        :TODO emit event to send updated schema
            @update:schema="updateEditor()"
            @update:uischema="updateEditor()"
           --->
      </div>
    </details>

    <details>
      <summary class="cursor-pointer">Preview</summary>
      <ResizeArea>
        <div class="card p-4" style="min-height: 106px">
            <JsonForms
                :class="'styleA'"
                :schema="jsonFormsSchema"
                :uischema="jsonFormsUiSchema"
                :data="jsonFormsData"
                :renderers="jsonFormRenderes"
                :ajv="ajv"
                :i18n="{translate: createI18nTranslate(localeCatalogue)}"
                v-if="jsonFormsSchema && jsonFormsUiSchema"
                @change="r => jsonFormsUpdated=r"
            />
        </div>
      </ResizeArea>

      Data
      <textarea class="w-full h-60 p-4 bg-white rounded" readonly disabled>{{ jsonFormsUpdated?.data }}</textarea>

    </details>

  </div>

</template>

<style>

</style>


<script setup>
import { ref } from 'vue'
import { onMounted, onBeforeUnmount } from 'vue'
import {JsonForms} from "@jsonforms/vue";
import {createAjv} from "@jsonforms/core";
import {ResizeArea,  SchemaCode, jsonFormRenderes, emitter, createI18nTranslate} from "../index";
import {translationsErrors as localeCatalogue} from "../translations/de";

const props = defineProps({
  jsonForms: Object
})

const jsonFormsSchema = ref({});
const jsonFormsUiSchema = ref({});
const jsonFormsData = ref({});
const jsonFormsUpdated = ref({});

onMounted(() => {
  jsonFormsSchema.value = props.jsonForms?.schema;
  jsonFormsUiSchema.value = props.jsonForms?.uischema;
  jsonFormsData.value = props.jsonForms?.data;

  emitter.on('formBuilderSchemaUpdated', (jsonForms) => {
    console.log("FormBuilderBarDetails emitter.on formBuilderSchemaUpdated")
    jsonFormsSchema.value = jsonForms?.schema;
    jsonFormsUiSchema.value = jsonForms?.uischema;
  });
});
// onBeforeUnmount(() => {
//   emitter.off('formBuilderSchemaUpdated');
// })

const ajv = createAjv();//is needed because reactive :schema & :uischema will throw error

</script>

