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
                v-if="jsonFormsSchema && jsonFormsUiSchema"
            />
        </div>
      </ResizeArea>
    </details>

  </div>

</template>

<style>

</style>


<script setup>
import { ref } from 'vue'
import { onMounted, onBeforeUnmount } from 'vue'
import {JsonForms} from "@jsonforms/vue";
import {ResizeArea,  SchemaCode, jsonFormRenderes, emitter} from "../index";

const props = defineProps({
  data: Object
})

const jsonFormsUiSchema = ref({});
const jsonFormsSchema = ref({});

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

</script>

