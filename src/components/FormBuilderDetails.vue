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
                :data="{}"
                :renderers="jsonFormRenderes"
                :ajv="ajv"
                :i18n="{translate: createI18nTranslate(localeCatalogue)}"
                v-if="jsonFormsSchema && jsonFormsUiSchema"
                @change="data => newData=data"
            />
        </div>
      </ResizeArea>

      Data
      <textarea class="w-full h-60 p-4 bg-white rounded" readonly disabled>{{ newData?.data }}</textarea>

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
  data: Object
})

const jsonFormsUiSchema = ref({});
const jsonFormsSchema = ref({});
const newData = ref({});

// const updateEditor = () => {
//   tool.props.jsonForms.schema = jsonFormsSchema.value;
//   tool.props.jsonForms.uischema = jsonFormsUiSchema.value;
//   rootForm.value.init();
// }

onMounted(() => {
  emitter.on('formBuilderSchemaUpdated', (jsonForms) => {
    jsonFormsSchema.value = jsonForms.schema;
    jsonFormsUiSchema.value = jsonForms.uischema;
  });
});
onBeforeUnmount(() => {
  emitter.off('formBuilderSchemaUpdated');
})

const ajv = createAjv();//is needed because reactive :schema & :uischema will throw error

</script>

